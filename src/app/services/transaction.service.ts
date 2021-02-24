import { Injectable } from '@angular/core';
import {
  Account,
  Connection,

  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,

  Transaction,
  sendAndConfirmTransaction,
  StakeProgram,
  SignatureResult,
  RpcResponseAndContext,
  Authorized,
  Lockup,
  TransactionInstruction,
} from '@solana/web3.js';
import { throwError } from 'rxjs';
import { ToastMessageService } from './toast-message.service';


import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private walletService: WalletService, private toastMessageService: ToastMessageService) {

    // console.log(this.walletService.acc.publicKey)
  }
  private formatErrors(error: any) {
    this.toastMessageService.msg.next({ message: error, segmentClass: 'toastError' })
    return throwError(error);
  }
  async verifyBalance(amountToSend: number, accountPubkey: PublicKey) {
    const balance = await this.walletService.con.getBalance(accountPubkey);
    const { blockhash } = await this.walletService.con.getRecentBlockhash('max');
    const currentTxFee = (await this.walletService.con.getFeeCalculatorForBlockhash(blockhash)).value.lamportsPerSignature
    const balanceCheck = amountToSend < balance + currentTxFee ? true : false;
    console.log(amountToSend, balance);
    if (!balanceCheck) {
      this.formatErrors('no balance')
      return false;
    }
    console.log('tx valid')
    return true
  }

  async transfer(toPubkey: PublicKey, lamports: any) {
    const connection: Connection = this.walletService.con;
    const wallet: Account = this.walletService.acc;

    const isValid = await this.verifyBalance(lamports, wallet.publicKey);
    if (isValid) {
      // get owned keys (used for security checks)
      const txParam: TransactionInstruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey,
        lamports,
      })

      const { blockhash } = await connection.getRecentBlockhash('max');
      const tx: Transaction = new Transaction({ feePayer: wallet.publicKey, recentBlockhash: blockhash }).add(txParam);

      this.sendTx(tx, wallet)
    }
  }

  async delegate(stakeAccParam, delegateAccParam) {
    const connection: Connection = this.walletService.con;
    const wallet: Account = this.walletService.acc;
    const { blockhash } = await connection.getRecentBlockhash('max');

    const stakeAcc: Transaction = StakeProgram.createAccount(stakeAccParam);
    const delegateInstruction: Transaction = StakeProgram.delegate(delegateAccParam)
    const ins: Transaction[] = [stakeAcc, delegateInstruction]
    const tx: Transaction = new Transaction({ feePayer: wallet.publicKey, recentBlockhash: blockhash }).add(...ins);
    console.log(tx);
    try {
      const txid = await sendAndConfirmTransaction(connection, tx, [wallet], {
        commitment: 'singleGossip',
      });
      this.toastMessageService.msg.next({ message: 'transaction submitted', segmentClass: 'toastInfo' });
      console.log(txid);
      return true;
    } catch (error) {
      console.error(error);
      this.toastMessageService.msg.next({ message: 'transaction failed', segmentClass: 'toastError' });
    }
  }

  async withdrawFromStakeAccount(stakeAccountPubKey, lamports: number) {
    const connection: Connection = this.walletService.con;
    const wallet: Account = this.walletService.acc;
    const isValid = await this.verifyBalance(lamports, stakeAccountPubKey);
    if (isValid) {
      const authorizedPubkey = this.walletService.acc.publicKey
      const toPubkey = authorizedPubkey;
      const params = {
        stakePubkey: stakeAccountPubKey,
        authorizedPubkey,
        toPubkey,
        lamports,
      };
      const tx = StakeProgram.withdraw(params);
      this.sendTx(tx, wallet)
    }
  }

  async undelegateFromVoteAccount(stakePubkey) {
    const connection: Connection = this.walletService.con;
    const wallet: Account = this.walletService.acc;

    const authorizedPubkey =  wallet.publicKey;
    const params = { stakePubkey, authorizedPubkey };
    const tx = StakeProgram.deactivate(params);

    this.sendTx(tx, wallet)
  }

  private async sendTx(tx, wallets) {
    try {
      const txid = await sendAndConfirmTransaction(this.walletService.con, tx, [wallets], {
        commitment: 'singleGossip',
      });
      this.toastMessageService.msg.next({ message: 'transaction submitted', segmentClass: 'toastInfo' });
      await this.confirmTransaction(txid)
      this.toastMessageService.msg.next({ message: 'transaction done', segmentClass: 'toastInfo' });
      console.log(txid);
      return true;
    } catch (error) {
      console.error(error);
      this.toastMessageService.msg.next({ message: 'transaction failed', segmentClass: 'toastError' });
    }
  }
  public async createStakeAccount(sol: number) {
    const wallet = this.walletService.acc;
    const con = this.walletService.con;

    try {

      const minimumAmount = await con.getMinimumBalanceForRentExemption(
        StakeProgram.space,
      );

      const newStakeAccount = new Account();
      let tx = StakeProgram.createAccount({
        fromPubkey: wallet.publicKey,
        stakePubkey: newStakeAccount.publicKey,
        authorized: new Authorized(wallet.publicKey, wallet.publicKey),
        lockup: new Lockup(0, 0, new PublicKey(0)),
        lamports: minimumAmount + sol * LAMPORTS_PER_SOL,
      });

      this.sendTx(tx, wallet)

    }
    catch (err) {
      console.log(err)
    }

  }
  private confirmTransaction(signature): Promise<void> {
    let subscriptionId;
    let response: RpcResponseAndContext<SignatureResult> | null = null;
    return new Promise((resolve, reject) => {
      try {
        subscriptionId = this.walletService.con.onSignature(
          signature,
          async (result, context) => {
            subscriptionId = undefined;
            response = {
              context,
              value: result,
            };
            resolve();
          },
          'max',
        );
      } catch (err) {
        reject(err);
      }
    });
  }
}

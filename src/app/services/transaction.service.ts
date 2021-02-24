import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
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

  constructor(private walletService: WalletService, private toastMessageService: ToastMessageService,
    public popoverController: PopoverController) {
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
    if (!balanceCheck) {
      this.formatErrors('no balance')
      return false;
    }
    console.log('tx valid')
    return true
  }

  async transfer(toPubkey: any, lamports: any) {
    // const toPubkey = new PublicKey(address);
    const connection: Connection = this.walletService.con;
    const wallet = this.walletService.walletController;

    const isValid = await this.verifyBalance(lamports, wallet.publicKey);
    if (isValid) {
      // get owned keys (used for security checks)
      const txParam: TransactionInstruction = SystemProgram.transfer({
        fromPubkey: wallet.publicKey,
        toPubkey,
        lamports,
      })

      this.sendTx(txParam);
    }

  }
  public async createStakeAccount(sol: number) {
    const wallet = this.walletService.walletController;
    const con = this.walletService.con;
    console.log(wallet)
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

      this.sendTx(tx.instructions[0])

    }
    catch (err) {
      console.log(err)
    }

  }
  async delegate(stakeAccParam, delegateAccParam) {
    // const connection: Connection = this.walletService.con;
    // const wallet: Account = this.walletService.acc;
    // const { blockhash } = await connection.getRecentBlockhash('max');

    // const stakeAcc: Transaction = StakeProgram.createAccount(stakeAccParam);
    // const delegateInstruction: Transaction = StakeProgram.delegate(delegateAccParam)
    // const ins: Transaction[] = [stakeAcc, delegateInstruction]
    // const tx: Transaction = new Transaction({ feePayer: wallet.publicKey, recentBlockhash: blockhash }).add(...ins);
    // console.log(tx);
    // try {
    //   const txid = await sendAndConfirmTransaction(connection, tx, [wallet], {
    //     commitment: 'singleGossip',
    //   });
    //   this.toastMessageService.msg.next({ message: 'transaction submitted', segmentClass: 'toastInfo' });
    //   console.log(txid);
    //   return true;
    // } catch (error) {
    //   console.error(error);
    //   this.toastMessageService.msg.next({ message: 'transaction failed', segmentClass: 'toastError' });
    // }
  }

  async withdrawFromStakeAccount(stakeAccountPubKey, lamports: number) {
    // const connection: Connection = this.walletService.con;
    // const wallet = this.walletService.walletController;
    // const isValid = await this.verifyBalance(lamports, stakeAccountPubKey);
    // if (isValid) {
    //   const authorizedPubkey = wallet.publicKey
    //   const toPubkey = authorizedPubkey;
    //   const params = {
    //     stakePubkey: stakeAccountPubKey,
    //     authorizedPubkey,
    //     toPubkey,
    //     lamports,
    //   };
    //   const tx = StakeProgram.withdraw(params);
    //   this.sendTx(tx, wallet)
    // }
  }

  async undelegateFromVoteAccount(stakePubkey) {
    // const connection: Connection = this.walletService.con;
    // const wallet: Account = this.walletService.acc;

    // const authorizedPubkey = wallet.publicKey;
    // const params = { stakePubkey, authorizedPubkey };
    // const tx = StakeProgram.deactivate(params);

    // this.sendTx(tx, wallet)
  }

  private async sendTx(txParam) {
    const connection: Connection = this.walletService.con;
    const wallet = this.walletService.walletController;
    try {

      const { blockhash } = await connection.getRecentBlockhash('max');
      const transaction: Transaction = new Transaction({ feePayer: wallet.publicKey, recentBlockhash: blockhash }).add(txParam);
      const signed = await wallet.signTransaction(transaction);
      this.popoverController.dismiss()
      const txid = await connection.sendRawTransaction(signed.serialize());
      this.toastMessageService.msg.next({ message: 'transaction submitted', segmentClass: 'toastInfo' });
      const confirmTx = await connection.confirmTransaction(txid, 'max');
      this.toastMessageService.msg.next({ message: 'transaction approved', segmentClass: 'toastInfo' });
    } catch (error) {
      console.error(error)
      this.toastMessageService.msg.next({ message: 'transaction failed', segmentClass: 'toastError' });
    }
  }


}

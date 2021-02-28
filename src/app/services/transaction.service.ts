import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import * as BufferLayout from "buffer-layout";
import BN from 'bn.js';
class Numberu64 extends BN {
  constructor(a){
    super(a);
  }

  /**
   * Convert to Buffer representation
   */
  toBuffer() {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);

    if (b.length === 8) {
      return b;
    }

    //assert__default['default'](b.length < 8, 'Numberu64 too large');
    const zeroPad = Buffer.alloc(8);
    b.copy(zeroPad);
    return zeroPad;
  }
}
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
export const uint64 = (property: string = "uint64"): Object => {
  return BufferLayout.blob(8, property);
};
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
      const txParam: any = SystemProgram.transfer({
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
      let tx: Transaction = StakeProgram.createAccount({
        fromPubkey: wallet.publicKey,
        stakePubkey: newStakeAccount.publicKey,
        authorized: new Authorized(wallet.publicKey, wallet.publicKey),
        lockup: new Lockup(0, 0, new PublicKey(0)),
        lamports: minimumAmount + sol * LAMPORTS_PER_SOL,
      });

      this.sendTx(tx)

    }
    catch (err) {
      console.log(err)
    }

  }

  sell_stSOL = (
    amount: number,
    userwSOLaddress: string,
    userstSOLaddress: string
  ): any => {
    console.log(amount,userwSOLaddress,userstSOLaddress);
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8("instruction"),
      uint64("amount")
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 11, // sell stSOL insturction
        amount:  new Numberu64(amount).toBuffer()
      },
      data
    );

    console.log(this.walletService.walletController.publicKey);
    const keys = [
      // { pubkey: this.walletService.SMART_POOL_PROGRAM_ACCOUNT_ID, isSigner: false, isWritable: true },
      { pubkey: this.walletService.STAKE_POOL_STATE_ACCOUNT, isSigner: false, isWritable: false },
      { pubkey: this.walletService.LIQ_POOL_STATE_ACCOUNT, isSigner: false, isWritable: false },
      { pubkey: this.walletService.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: this.walletService.LIQ_POOL_WSOL_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: this.walletService.LIQ_POOL_ST_SOL_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: this.walletService.PDA_LIQ_POOL_AUTHORITY, isSigner: false, isWritable: false },
      { pubkey: new PublicKey(userwSOLaddress), isSigner: false, isWritable: true },
      { pubkey: new PublicKey(userstSOLaddress), isSigner: false, isWritable: true },
      { pubkey: this.walletService.walletController.publicKey, isSigner: true, isWritable: false },
    ];
  
    const txIns =  new TransactionInstruction({
      keys,
      programId: this.walletService.SMART_POOL_PROGRAM_ACCOUNT_ID,
      data,
    });
    this.sendTx(txIns);
  };
  private async sendTx(txParam: TransactionInstruction | Transaction) {
    const connection: Connection = this.walletService.con;
    const wallet = this.walletService.walletController;
    console.log(wallet)
    try {
      
      const { blockhash } = await connection.getRecentBlockhash('max');
      let transaction: Transaction = new Transaction({feePayer: wallet.publicKey, recentBlockhash: blockhash }).add(txParam);
      // transaction.addSigner(wallet.publicKey)
      transaction = await wallet.signTransaction(transaction);
      console.log(transaction)
      const rawTransaction = transaction.serialize();
      this.popoverController.dismiss()
      const txid = await connection.sendRawTransaction(rawTransaction);
      this.toastMessageService.msg.next({ message: 'transaction submitted', segmentClass: 'toastInfo' });
      const confirmTx = await connection.confirmTransaction(txid,'max');
      this.toastMessageService.msg.next({ message: 'transaction approved', segmentClass: 'toastInfo' });
      console.log(confirmTx,txid)
    } catch (error) {
      console.error(error)
      this.toastMessageService.msg.next({ message: 'transaction failed', segmentClass: 'toastError' });
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
}

import { Injectable } from '@angular/core';
import {
  Account,
  Connection,

  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,

  Transaction,
  sendAndConfirmTransaction,

  TransferParams,
  ConfirmedSignatureInfo,
  ConfirmedTransaction,
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
  async verifyBalance(amountToSend?: number) {
    const balance = await this.walletService.con.getBalance(this.walletService.acc.publicKey);
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
    const isValid = await this.verifyBalance(lamports);
    if (isValid) {
      // get owned keys (used for security checks)
      const connection: Connection = this.walletService.con;
      const wallet: Account = this.walletService.acc;
      const txParam: TransferParams = {
        fromPubkey: wallet.publicKey,
        toPubkey,
        lamports,
      }

      const { blockhash } = await connection.getRecentBlockhash('max');
      const tx: Transaction = new Transaction({ feePayer: wallet.publicKey, recentBlockhash: blockhash }).add(SystemProgram.transfer(txParam));

      try {
        const txid = await sendAndConfirmTransaction(connection, tx, [wallet], {
          commitment: 'singleGossip',
        });
        this.toastMessageService.msg.next({message: 'transaction submitted', segmentClass: 'toastInfo'});
        console.log(txid);
        return true;
      } catch (error) {
        console.error(error);
        this.toastMessageService.msg.next({message: 'transaction failed', segmentClass: 'toastError'});
      }
    }
  }

  async getWalletHistory() {
    if(this.walletService.acc){

      const signatures: ConfirmedSignatureInfo[] = await this.walletService.con.getConfirmedSignaturesForAddress2(await this.walletService.acc.publicKey);
      let rd: any[] = [];
      let walletHistory = []
      signatures.forEach(async signature => {
        rd.push(this.walletService.con.getConfirmedTransaction(signature.signature));
      });
      // const history: ConfirmedTransaction = await Promise.all([this.walletService.con.getConfirmedTransaction(signatures)]);
      const records: ConfirmedTransaction[] = await Promise.all(rd);
      records.forEach((record, i) => {
        const from = record?.transaction?.instructions[0]?.keys[0]?.pubkey.toBase58() || null;
        const to = record.transaction?.instructions[0]?.keys[1]?.pubkey.toBase58() || null;;
        const amount = (record.meta?.postBalances[1] - record.meta?.preBalances[1]) / LAMPORTS_PER_SOL || null;
        walletHistory.push({ signature: signatures[i].signature, block: record.slot, amount, from, to } || null)
      });
      return walletHistory;
    }
  }
}
  
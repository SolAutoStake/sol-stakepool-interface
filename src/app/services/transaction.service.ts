import { Injectable } from '@angular/core';
import {
  Account,
  Connection,
  BpfLoader,
  BPF_LOADER_PROGRAM_ID,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  AccountInfo,
  Cluster,
  clusterApiUrl,
  TransferParams,
} from '@solana/web3.js';
import { WalletService } from './wallet.service';
@Injectable({
  providedIn: 'root'
})
export class TransactionService {

  constructor(private walletService: WalletService) {
    // console.log(this.walletService.acc.publicKey)
  }
  async testTx() {
    await this.transfer(new PublicKey('GTGaf3uDnsUWGb2o3ctKsweWynFkKiavCcMcBzqRM5Py'), 0.5 * LAMPORTS_PER_SOL)
  }
  async transfer(toPubkey: PublicKey, lamports: number) {
    // console.log(this.walletService.acc.publicKey.toBase58(), toPubkey.toBase58())
    const txParam: TransferParams = {
      fromPubkey: this.walletService.acc.publicKey,
      toPubkey,
      lamports,
    }
    const tx: Transaction = new Transaction().add(SystemProgram.transfer(txParam));

    tx.recentBlockhash = (
      await this.walletService.con.getRecentBlockhash('max')
    ).blockhash;
    // sign sender fee
 
    try {
      const confirm_tx = await sendAndConfirmTransaction(this.walletService.con, tx, [this.walletService.acc], {
        commitment: 'singleGossip',
      });
      console.log(confirm_tx);
    } catch (error) {
        console.error(error);
    }
  
  }
  async signAndSendTransaction(
    connection: Connection,
    transaction: Transaction,
    wallet: Account,
    signers: Account[],
  ) {
    transaction.recentBlockhash = (
      await connection.getRecentBlockhash('max')
    ).blockhash;
    transaction.sign(wallet);
    // if (signers.length > 0) {
    //   transaction.partialSign(...signers);
    // }
    const signature: Buffer = transaction.signature
    console.log('after', transaction)
    transaction.addSignature(wallet.publicKey, signature);

    const vs = transaction.verifySignatures();
    console.log(vs);
    // transaction = await transaction.add(transaction);
    console.log('row', transaction.serialize())
    const rawTransaction = transaction.serialize();
    return await connection.sendRawTransaction(rawTransaction, {
      preflightCommitment: 'single',
    });
  }
}

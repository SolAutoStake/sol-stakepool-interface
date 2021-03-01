import { Injectable } from '@angular/core';
import { PopoverController } from '@ionic/angular';
import * as BufferLayout from "buffer-layout";
import BN from 'bn.js';
class Numberu64 extends BN {
  constructor(a) {
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
  StakeAuthorizationType,
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

      this.sendTx([txParam]);
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

      const fromPubkey = wallet.publicKey;
      const newAcc = new Account();
      const newAccountPubkey = newAcc.publicKey;
      const authorizedPubkey = wallet.publicKey;
      const authorized = new Authorized(authorizedPubkey, authorizedPubkey);
      const lockup = new Lockup(0, 0, fromPubkey);
      const lamports = minimumAmount + sol * LAMPORTS_PER_SOL;
      let tx: Transaction = StakeProgram.createAccount({
        fromPubkey,
        stakePubkey: newAccountPubkey,
        authorized,
        lockup,
        lamports,
      });
      this.sendTx([tx], [newAcc])

    }
    catch (err) {
      console.log(err)
    }

  }
  private async sendTx(txParam: TransactionInstruction[] | Transaction[], extraSigners?: Account[]) {
    const connection: Connection = this.walletService.con;
    // sol-wallet-adapter
    const wallet = this.walletService.walletController;
    try {
      const { blockhash } = await connection.getRecentBlockhash('max');
      let transaction: Transaction = new Transaction({ feePayer: wallet.publicKey, recentBlockhash: blockhash }).add(...txParam);
      transaction = await wallet.signTransaction(transaction);
      //LMT: check null signatures
      for (let i = 0; i < transaction.signatures.length; i++) {
        if (!transaction.signatures[i].signature) {
          throw Error(`missing signature for ${transaction.signatures[i].publicKey.toString()}. Check .isSigner=true in tx accounts`)
        }
      }
      //LMT: add extra signers (fix create-token-account problem)
      if (extraSigners) transaction.partialSign(...extraSigners);
      const rawTransaction = transaction.serialize({ requireAllSignatures: false });
      this.popoverController.dismiss()
      const txid = await connection.sendRawTransaction(rawTransaction);
      this.toastMessageService.msg.next({ message: 'transaction submitted', segmentClass: 'toastInfo' });
      const confirmTx = await connection.confirmTransaction(txid, 'max');
      this.toastMessageService.msg.next({ message: 'transaction approved', segmentClass: 'toastInfo' });
      console.log(confirmTx, txid)
      this.walletService.currentWalletSubject.next(wallet.publicKey)
    } catch (error) {
      console.error(error);
      this.toastMessageService.msg.next({ message: 'transaction failed', segmentClass: 'toastError' });
    }
  }

  public sell_stSOL(amount: number, userwSOLaddress: string, userstSOLaddress: string) {
    const dataLayout = BufferLayout.struct([
      BufferLayout.u8("instruction"),
      uint64("amount")
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 11, // sell stSOL insturction
        amount: new Numberu64(amount).toBuffer()
      },
      data
    );

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

    const txIns = new TransactionInstruction({
      keys,
      programId: this.walletService.SMART_POOL_PROGRAM_ACCOUNT_ID,
      data,
    });
    this.sendTx([txIns]);
  };

  async depositToStakePOOL(
    stakeAccount: any
  ) {

    console.log(stakeAccount)
    const userStakeAccPubkey = new PublicKey(stakeAccount.publicKey);

    const dataLayout = BufferLayout.struct([
      BufferLayout.u8("instruction")
    ]);

    const data = Buffer.alloc(dataLayout.span);
    dataLayout.encode(
      {
        instruction: 6, // deposit stakeaccount to  insturction
      },
      data
    );

    ///   User: Deposit some stake into the pool.  The output is a "pool" token representing ownership
    ///   into the pool. Inputs are converted to the current ratio.
    ///
    ///   0. [w] Stake pool
    ///   1. [w] Validator stake list storage account
    ///   2. [] Stake pool deposit authority
    ///   3. [] Stake pool withdraw authority
    ///   4. [w] Stake account to join the pool (owned by the user/signer)
    ///   5. [w] Validator stake account for the stake account to be merged with
    ///   6. [w] User account to receive pool tokens
    ///   7. [w] Account to receive pool fee tokens
    ///   8. [w] Pool token mint account
    ///   9. '[]' Sysvar clock account (required)
    ///   10. '[]' Sysvar stake history account
    ///   11. [] Token program id (Tokenkeg...),
    ///   12. [] Stake program id,

    // PULL ACTIVESTAKEACCOUNT PARSED DATA
    // COMPARE VOTED ACCOUNT
    // RETURN THE COMPARED STAKE_ACCOUNT_POOL_OWNED ADDRESS PUBKEY
    // stakeAccountAddress

    // stakeconomy validators
    const poolOwned_StakeAccount = [
      {
        pubkey: this.walletService.STAKE_ACCOUNT_POOL_OWNED_1,
        voteAccount: new PublicKey('2HUKQz7W2nXZSwrdX5RkfS2rLU4j1QZLjdGCHcoUKFh3')
      },
      {
        pubkey: this.walletService.STAKE_ACCOUNT_POOL_OWNED_2,
        voteAccount: new PublicKey('87QuuzX6cCuWcKQUFZFm7vP9uJ72ayQD5nr6ycwWYWBG')
      }
    ]
    const findVoter = poolOwned_StakeAccount.filter(voter => voter.voteAccount.toBase58() == stakeAccount.data.parsed.info.stake.delegation.voter)[0]
    console.log(findVoter, stakeAccount.data.parsed.info.stake.delegation.voter)
    const keys = [
      // { pubkey: this.walletService.SMART_POOL_PROGRAM_ACCOUNT_ID, isSigner: false, isWritable: true },
      { pubkey: this.walletService.STAKE_POOL_STATE_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: this.walletService.VALIDATOR_STAKE_LIST, isSigner: false, isWritable: true },
      { pubkey: this.walletService.STAKE_POOL_DEPOSIT_AUTHORITY, isSigner: false, isWritable: false },
      { pubkey: this.walletService.POOL_WITHDRAW_AUTHORITY, isSigner: false, isWritable: false },
      { pubkey: userStakeAccPubkey, isSigner: false, isWritable: true },
      { pubkey: poolOwned_StakeAccount[0].pubkey, isSigner: false, isWritable: true },
      // todo - ask user for stSOL token destination address (or create a new stSOL token acc)
      { pubkey: new PublicKey("GWiVqdwyRnDTofxeS6uUNSrfbjbcryhzxg3st1iTyHsB"), isSigner: false, isWritable: true }, //where to receive stSOL
      { pubkey: new PublicKey("GWiVqdwyRnDTofxeS6uUNSrfbjbcryhzxg3st1iTyHsB"), isSigner: false, isWritable: true }, //acc to receive pool fee tokens (0% - disabled)
      { pubkey: this.walletService.ST_SOL_MINT_ACCOUNT, isSigner: false, isWritable: true },
      { pubkey: this.walletService.Sysvar_clock, isSigner: false, isWritable: false },
      { pubkey: this.walletService.Sysvar_stake_history, isSigner: false, isWritable: false },
      { pubkey: this.walletService.TOKEN_PROGRAM_ID, isSigner: false, isWritable: false },
      { pubkey: this.walletService.STAKE_PROGRAM_ID, isSigner: false, isWritable: false },

    ];

    //sets DEPOSIT_AUTH as "Withdrawer"
    const txAuthToStakerTX = StakeProgram.authorize({
      stakePubkey: userStakeAccPubkey,
      authorizedPubkey: this.walletService.walletController.publicKey,
      newAuthorizedPubkey: this.walletService.STAKE_POOL_DEPOSIT_AUTHORITY,
      stakeAuthorizationType: { index: 1 }, // Withdraw
    })

    //sets DEPOSIT_AUTH as "Staker"
    const txAuthToPOOLOWNERTX = StakeProgram.authorize({
      stakePubkey: userStakeAccPubkey,
      authorizedPubkey: this.walletService.walletController.publicKey,
      newAuthorizedPubkey: this.walletService.STAKE_POOL_DEPOSIT_AUTHORITY,
      stakeAuthorizationType: { index: 0 }, // Staker
    })
    //note: during "deposit" instruction, is sets both auths to WITHDRAW_AUTH

    const depositTX = new TransactionInstruction({
      keys,
      programId: this.walletService.SMART_POOL_PROGRAM_ACCOUNT_ID,
      data,
    });

    const transactions: any = [txAuthToStakerTX, txAuthToPOOLOWNERTX, depositTX]
    await this.sendTx(transactions);

  };

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

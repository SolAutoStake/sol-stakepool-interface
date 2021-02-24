import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, PopoverController } from '@ionic/angular';
import { LAMPORTS_PER_SOL, PublicKey, SystemProgram, Connection, TransactionInstruction , Transaction, sendAndConfirmTransaction} from '@solana/web3.js';
import { TransactionService } from 'src/app/services/transaction.service';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-send-token-popup',
  templateUrl: './send-token-popup.component.html',
  styleUrls: ['./send-token-popup.component.scss']
})
export class SendTokenPopupComponent implements OnInit {
  @ViewChild('addressInput') address: IonInput;
  @ViewChild('amountInput') amount: IonInput;
  constructor(
    private transactionService: TransactionService,
    private walletService: WalletService,
    public popoverController: PopoverController,
  ) { }

  async ngOnInit(): Promise<void> {

  }
  async transferSol() {
    const toPubkey: PublicKey = new PublicKey(this.address.value);
    const amount = Number(this.amount.value) * LAMPORTS_PER_SOL;
    const connection = this.walletService.con;
    // if (toPubkey && amount) {

    //   // this.transactionService.transfer(address, amount);
    //   // this.popoverController.dismiss();


    //   try {
    //     const txParam: TransactionInstruction = SystemProgram.transfer({
    //       fromPubkey: this.walletService.currentWallet$,
    //       toPubkey,
    //       lamports: 100,
    //     })
  
    //     const { blockhash } = await connection.getRecentBlockhash('max');
    //     const tx: Transaction = new Transaction({ feePayer: fromPubkey.publicKey, recentBlockhash: blockhash }).add(txParam);
  

    //     const txid = await sendAndConfirmTransaction(this.walletService.con, tx, [fromPubkey], {
    //       commitment: 'singleGossip',
    //     });
    //     await connection.confirmTransaction(txid);
    //   } catch (e) {
    //     console.warn(e);
    //   }
    // }
  }

}

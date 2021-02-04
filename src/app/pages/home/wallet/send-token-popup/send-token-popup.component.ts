import { Component, OnInit, ViewChild } from '@angular/core';
import { IonInput, PopoverController } from '@ionic/angular';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { PriceFeedService } from 'src/app/services/price-feed.service';
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
    public popoverController: PopoverController,
     ) { }

  async ngOnInit(): Promise<void> {

  }
  transferSol(){
    const address: PublicKey = new PublicKey(this.address.value);
    const amount = Number(this.amount.value) * LAMPORTS_PER_SOL;
    console.log(address, amount);
    if(address && amount)
    this.transactionService.transfer(address, amount);
    this.popoverController.dismiss();
  }
}

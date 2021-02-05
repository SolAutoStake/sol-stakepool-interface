import { Component, OnInit } from '@angular/core';
import { faCheck, faTimes, faWallet } from '@fortawesome/free-solid-svg-icons';
import { PopoverController } from '@ionic/angular';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { PriceFeedService } from 'src/app/services/price-feed.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';

import { WalletService } from 'src/app/services/wallet.service';
import { SendTokenPopupComponent } from './send-token-popup/send-token-popup.component';
@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss']
})
export class WalletComponent implements OnInit {
  wallet = faWallet;
  vMark = faCheck;
  xMark = faTimes;
  public balance = 0;
  public solanaUsdBalance = 0;
  constructor(
    public popoverController: PopoverController, 
    public walletService: WalletService,
     private priceFeedService: PriceFeedService,
    private toastMessageService: ToastMessageService) { }

  async ngOnInit(): Promise<void> {
    this.walletService.currentWallet$.subscribe( async wallet => {
      if(wallet != null){
        const priceFeed = await this.priceFeedService.getPriceList();
        this.balance = await this.walletService.con.getBalance(this.walletService.acc.publicKey) / LAMPORTS_PER_SOL;
        this.solanaUsdBalance = priceFeed.solana.usd * this.balance;
      }
    })
  }
  async openSendTokenPopup() {
    const popover = await this.popoverController.create({
      component: SendTokenPopupComponent,
      cssClass: "send-token-popup",
      animated: true,
    });
    return await popover.present();
  }
  copyMyAddress(){
    try {
      navigator.clipboard.writeText(this.walletService.acc.publicKey.toBase58()).then();
      this.toastMessageService.msg.next({message: 'address copied to clipboard', segmentClass: 'toastInfo'})
    } catch (error) {
      
    }
  }
}

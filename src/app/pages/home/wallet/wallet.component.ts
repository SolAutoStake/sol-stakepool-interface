import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { faCheck, faTimes, faWallet } from '@fortawesome/free-solid-svg-icons';
import { PopoverController } from '@ionic/angular';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { LoaderService } from 'src/app/services/loader.service';
import { PriceFeedService } from 'src/app/services/price-feed.service';
import { ToastMessageService } from 'src/app/services/toast-message.service';
import { UtilsService } from 'src/app/services/utils.service';

import { WalletService } from 'src/app/services/wallet.service';
import { SendTokenPopupComponent } from './send-token-popup/send-token-popup.component';
@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  providers: [LoaderService]
})
export class WalletComponent implements OnChanges {
  @Input('currentWallet') wallet;
  walletIcon = faWallet;
  vMark = faCheck;
  xMark = faTimes;
  public solBalance = null
  public usdBalance = null;
  public address= null;
  constructor(
    public popoverController: PopoverController,
    public walletService: WalletService,
    private utilService: UtilsService,
    public loaderService :LoaderService
    ) { }

    ngOnChanges(): void {
      //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
      //Add '${implements OnChanges}' to the class.
      if(this.wallet){
        console.log(this.wallet);
         this.getWalletData(this.wallet)
        }
    }

  async getWalletData(wallet){
    console.log(wallet)
    const balance = await this.walletService.con.getBalance(wallet)
    this.solBalance = (balance / LAMPORTS_PER_SOL).toFixed(2);
    this.usdBalance = await this.utilService.solanaUsdPrice(this.solBalance)
  }
  async openSendTokenPopup() {
    const popover = await this.popoverController.create({
      component: SendTokenPopupComponent,
      cssClass: "transfer-token-popup",
      animated: true,
    });
    return await popover.present();
  }

}

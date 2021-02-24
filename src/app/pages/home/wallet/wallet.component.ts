import { Component, OnInit } from '@angular/core';
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
export class WalletComponent implements OnInit {
  wallet = faWallet;
  vMark = faCheck;
  xMark = faTimes;
  public solBalance = null
  public usdBalance = null;
  public address= null;
  public currentWallet
  constructor(
    public popoverController: PopoverController,
    public walletService: WalletService,
    private utilService: UtilsService,
    public loaderService :LoaderService
    ) { }

  async ngOnInit(): Promise<void> {
    this.walletService.currentWallet$.subscribe(async (wallet) => {
      console.log(wallet)
      // this.address = wallet.address;
      // this.solBalance = (wallet.balance / LAMPORTS_PER_SOL).toFixed(2);
      this.usdBalance = await this.utilService.solanaUsdPrice(this.solBalance)
    })
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

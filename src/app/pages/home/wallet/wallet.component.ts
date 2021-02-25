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
  public address = null;
  tokensByOwner: any[] = null;
  constructor(
    public popoverController: PopoverController,
    public walletService: WalletService,
    public utilsService: UtilsService,
    public loaderService: LoaderService
  ) { }

  ngOnChanges(): void {
    if (this.wallet) {
      this.getWalletData(this.wallet)
    }
  }
  
  async getWalletData(wallet) {
    const balance = await this.walletService.con.getBalance(wallet)
    this.solBalance = (balance / LAMPORTS_PER_SOL).toFixed(2);
    this.usdBalance = this.utilsService.solanaUsdPrice(this.solBalance)
    
    // SPL tokens
    this.tokensByOwner = (await this.walletService.getTokensOwner()).parsedTokenData
  }
  async openSendTokenPopup() {
    const popover = await this.popoverController.create({
      component: SendTokenPopupComponent,
      cssClass: "transfer-token-popup",
      animated: true,
    });
    return await popover.present();
  }

  async sell(){

  }
}

import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { faCheck, faTimes, faWallet } from '@fortawesome/free-solid-svg-icons';
import { PopoverController } from '@ionic/angular';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { LoaderService } from 'src/app/services/loader.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
import { SendTokenPopupComponent } from './send-token-popup/send-token-popup.component';

import { Token } from '../../../models/token';
import { SellStSOLPopupComponent } from './sell-st-sol-popup/sell-st-sol-popup.component';
@Component({
  selector: 'app-wallet',
  templateUrl: './wallet.component.html',
  styleUrls: ['./wallet.component.scss'],
  providers: [LoaderService]
})
export class WalletComponent implements OnChanges {
  @Input('currentWallet') wallet;
  copyAddress = faCopy;
  walletIcon = faWallet;
  vMark = faCheck;
  xMark = faTimes;
  public solBalance = null
  public usdBalance = null;
  public address = null;
  tokensByOwner: any[] = [];;
  constructor(
    public popoverController: PopoverController,
    public walletService: WalletService,
    public utilsService: UtilsService,
    public loaderService: LoaderService
  ) { }

  ngOnChanges(): void {
    if (this.wallet) {
      this.getWalletData(this.wallet)
      console.log(this.wallet)
    }
  }
  
  async getWalletData(wallet) {
    this.tokensByOwner.push({
      address: this.wallet.toBase58(),
      name: 'SOL',
      amount: await this.walletService.con.getBalance(wallet) / LAMPORTS_PER_SOL,
      tokenAmount: null,
      isNative: true
    })
    // SPL tokens
    this.tokensByOwner = this.tokensByOwner.concat((await this.walletService.getTokensOwner()).tokenAccountsFiltered);

    console.log(this.tokensByOwner)
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
    const popover = await this.popoverController.create({
      component: SellStSOLPopupComponent,
      cssClass: "transfer-token-popup",
      animated: true,
    });
    return await popover.present();
  }
}

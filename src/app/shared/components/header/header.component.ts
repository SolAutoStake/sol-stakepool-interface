import { Component, OnInit, ViewChild } from '@angular/core';
import {  faExternalLinkAlt, faRocket } from '@fortawesome/free-solid-svg-icons';
import { IonSelect, PopoverController } from '@ionic/angular';
import {  LAMPORTS_PER_SOL, Account } from '@solana/web3.js';
import { UtilsService } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
import { ConnectWalletPopupComponent } from './connect-wallet-popup/connect-wallet-popup.component';
import { SettingsBoxComponent } from './settings-box/settings-box.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild(IonSelect) selectNetwork: IonSelect;
  public logo = faRocket;
  public exLink = faExternalLinkAlt;
  public wallet: Account = null;
  public balance: any = 0;
  LAMPORTS_PER_SOL = LAMPORTS_PER_SOL;
  constructor(
    private popoverController: PopoverController,
    public walletService: WalletService,
    public utilsService: UtilsService
  ) { }

  ngOnInit(): void {

    this.walletService.currentWallet$.subscribe(async (wallet) => {
      this.wallet = wallet;
      if(wallet){
        console.log(this.wallet.publicKey, this.walletService.con);
        this.balance = await this.walletService.con.getBalance(this.wallet.publicKey);
        this.balance = (this.balance / LAMPORTS_PER_SOL).toFixed(2)
      }
    })
  }
  async openSettingBox(ev: any) {
    const popover = await this.popoverController.create({
      component: SettingsBoxComponent,
      cssClass: 'setting-box',
      event: ev,
      translucent: true
    });
    return await popover.present();
  }
  // async openWalletConnector() {
  //   await this.walletService.connectWithProvider()
  // }
  async openWalletConnector() {
    console.log('test')
    // await this.walletService.connectWithProvider()
    const popover = await this.popoverController.create({
      component: ConnectWalletPopupComponent,
      cssClass: "connect-wallet-popover",
      animated: true,
    });
    return await popover.present();
  }

  public myWallet() {
    window.open(`https://explorer.solana.com/address/${this.wallet.publicKey.toBase58()}?cluster=${this.walletService.switchNetworkSubject.value}`);
  }


}

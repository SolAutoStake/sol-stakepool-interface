import { Component, OnInit, ViewChild } from '@angular/core';
import { faEllipsisH, faExternalLinkAlt, faRocket, faWifi } from '@fortawesome/free-solid-svg-icons';
import { IonSelect, PopoverController } from '@ionic/angular';
import { AccountInfo, Cluster, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Wallet } from 'src/app/models';
import { LocalDataService } from 'src/app/services/local-data.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
import { ConnectWalletPopupComponent } from '../connect-wallet-popup/connect-wallet-popup.component';
@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss']
})
export class HeaderComponent implements OnInit {
  @ViewChild(IonSelect) selectNetwork: IonSelect;
  public logo = faRocket;
  public dots = faEllipsisH;
  public exLink = faExternalLinkAlt;
  public networks = faWifi;
  public cluster = this.localDataService.getProp('cluster') || this.walletService.getCurrentCluster();
  public wallet: Wallet = null;
  constructor(
    private popoverController: PopoverController,
    public walletService: WalletService,
    public utilsService: UtilsService,
    private localDataService: LocalDataService
  ) { }

  ngOnInit(): void {
    console.log(this.cluster)
    this.walletService.currentWallet$.subscribe((wallet: Wallet) => {

      this.wallet = wallet;
    })
  }
  async openWalletConnector() {
    const popover = await this.popoverController.create({
      component: ConnectWalletPopupComponent,
      cssClass: "connect-wallet-popover",
      animated: true,
    });
    return await popover.present();
  }
  async onClusterChange($event) {
    const cluster: Cluster = $event.detail.value;
    this.walletService.switchNetworkSubject.next(cluster)
    // if wallet already connected then change network
    if (this.localDataService.getProp('Mnemonic')) {
      const Mnemonic = this.localDataService.getProp('Mnemonic').toString();
      await this.walletService.connectWallet(Mnemonic, cluster);
    }
  }

  public myWallet() {
    window.open(`https://explorer.solana.com/address/${this.wallet.address}?cluster=${this.walletService.getCurrentCluster()}`);
  }


}

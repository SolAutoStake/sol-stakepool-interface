import { Component, OnInit, ViewChild } from '@angular/core';
import { faWifi } from '@fortawesome/free-solid-svg-icons';
import { Cluster } from '@solana/web3.js';
import { LocalDataService } from 'src/app/services/local-data.service';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-settings-box',
  templateUrl: './settings-box.component.html',
  styleUrls: ['./settings-box.component.scss']
})
export class SettingsBoxComponent implements OnInit {
  public networks = faWifi;
  public cluster = this.walletService.getCurrentCluster()
  constructor(public walletService: WalletService, private localDataService: LocalDataService) { }

  ngOnInit(): void {
  console.log('cluster', this.cluster);
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
}

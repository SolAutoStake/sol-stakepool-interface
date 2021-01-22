import { Component } from '@angular/core';
import { WalletService } from './services/wallet.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent {
  title = 'ng-sol-stake-interface';
  constructor(private walletService: WalletService){
    this.walletService.currentWallet.subscribe(wallet=> console.log(wallet));
  }
}

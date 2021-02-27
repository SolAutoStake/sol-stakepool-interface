import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent  {
  public currentWallet = null;
  constructor(private walletService: WalletService) {
   }

   ionViewWillEnter(){
    this.currentWallet = this.walletService.walletController ? this.walletService.walletController.publicKey : null;
    console.log(this.currentWallet);
    this.walletService.currentWallet$.subscribe(async (wallet) => {
      this.currentWallet = wallet
    })
   }


}

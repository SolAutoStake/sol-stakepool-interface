import { Component, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {
  public currentWallet = null;
  constructor(private walletService: WalletService) {
   }

   ngOnInit(){
    this.walletService.currentWallet$.subscribe(async (wallet) => {
      console.log(wallet)
      this.currentWallet = wallet
    })
   }


}

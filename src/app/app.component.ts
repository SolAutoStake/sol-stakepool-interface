import { Component, OnInit } from '@angular/core';
import { WalletService } from './services/wallet.service';
import { animate, style, transition, trigger } from '@angular/animations';
import { TransactionService } from './services/transaction.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  constructor(private walletService: WalletService, private transactionService:TransactionService){
    this.walletService.currentWallet$.subscribe(wallet=> console.log(wallet));
  }
  ngOnInit(): void {
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    this.walletService.populate();
    setTimeout(() => {
      this.transactionService.testTx();
    }, 1500);
  }
}

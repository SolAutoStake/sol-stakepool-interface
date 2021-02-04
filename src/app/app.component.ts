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
  private pw = 'marco';
  public sp = false;
  constructor(private walletService: WalletService){
  }
  async ngOnInit(): Promise<void> {
    const answer = prompt('what is the pw');
    if(answer == this.pw){
      this.sp = true;
    }
    //Called after the constructor, initializing input properties, and the first call to ngOnChanges.
    //Add 'implements OnInit' to the class.
    await this.walletService.populate();
    
  }
}

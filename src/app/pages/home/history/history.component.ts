import { Component, OnInit } from '@angular/core';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { TransactionService } from 'src/app/services/transaction.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  copyAddress = faCopy;
  txBook = faBook;
  txHistory: any = [];
  constructor(public utilsService:UtilsService,private walletService:WalletService, private transactionService:TransactionService) { }

  async ngOnInit(): Promise<void> {
    this.walletService.switchNetworkSubject.subscribe(async val=>{
     setTimeout(async () => {
       
       this.txHistory = await this.transactionService.getWalletHistory();
     }, 1000);
      
      
    })
  }

  openTxRecord(signature: string){
    window.open(`https://explorer.solana.com/tx/${signature}?cluster=${this.walletService.getCurrentCluster()}`);
  }
}

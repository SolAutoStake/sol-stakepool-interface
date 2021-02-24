import { Component, OnInit } from '@angular/core';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { faBook } from '@fortawesome/free-solid-svg-icons';
import { LoaderService } from 'src/app/services/loader.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { UtilsService } from 'src/app/services/utils.service';
import { WalletService } from 'src/app/services/wallet.service';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss'],
  providers: [LoaderService]
})
export class HistoryComponent implements OnInit {
  copyAddress = faCopy;
  txBook = faBook;
  txHistory = null;
  public searchTerm: string = "";
  constructor(
    public loaderService :LoaderService,
    public utilsService:UtilsService,
    private walletService:WalletService,
     private transactionService:TransactionService) { 
  }

  async ngOnInit(): Promise<void> {
    this.walletService.currentWallet$.subscribe( async wallet => {
      this.loaderService.show()
        this.txHistory = await this.walletService.getWalletHistory(wallet.publicKey)
        this.loaderService.hide()
    })

  }
  openTxRecord(signature: string){
    window.open(`https://explorer.solana.com/tx/${signature}?cluster=${this.walletService.switchNetworkSubject.value}`);
  }
}

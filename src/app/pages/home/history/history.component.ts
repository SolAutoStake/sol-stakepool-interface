import { Component, Input, OnChanges, OnInit } from '@angular/core';
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
export class HistoryComponent implements OnChanges {
  @Input('currentWallet') wallet;
  copyAddress = faCopy;
  txBook = faBook;
  txHistory = null;
  public searchTerm: string = "";
  constructor(
    public loaderService: LoaderService,
    public utilsService: UtilsService,
    private walletService: WalletService,
    private transactionService: TransactionService) {
  }

  ngOnChanges() {
    console.log(this.wallet)
    if (this.wallet) {
      this.getTxHistory(this.wallet)
    } else{
      this.txHistory = null
    }
  }
  
  async getTxHistory(wallet) {
    this.loaderService.show()
    this.txHistory = await this.walletService.getWalletHistory(wallet)
    this.loaderService.hide()
  }
  openTxRecord(signature: string) {
    window.open(`https://explorer.solana.com/tx/${signature}?cluster=${this.walletService.networkSubject.value.name}`);
  }
}

import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { LAMPORTS_PER_SOL } from '@solana/web3.js';
import { LoaderService } from 'src/app/services/loader.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-pool',
  templateUrl: './pool.component.html',
  styleUrls: ['./pool.component.scss'],
  providers: [LoaderService]
})
export class PoolComponent implements OnChanges {
  poolIcon = faBolt
  @Input('currentWallet') wallet;
  LAMPORTS_PER_SOL = LAMPORTS_PER_SOL
  selectedActiveStakeAccount
  selectedstSOLwallet;
  activeStakeAccounts: any[] = null;
  stSOLwallets: any[] = null;
  constructor(
    public loaderService: LoaderService,
    private walletService: WalletService,
    private transactionService: TransactionService
  ) { }

  async ngOnChanges() {
    if (this.wallet) {
      this.loaderService.show()
      const stakeAccounts = await this.walletService.getStakeAccountsByOwner().toPromise();
      this.activeStakeAccounts = stakeAccounts.filter((acc: any) => acc.account.data.parsed.type == 'delegated')
      console.log(this.activeStakeAccounts)
      const tokensByOwner = (await this.walletService.getTokensOwner()).tokenAccountsFiltered;
      this.stSOLwallets = tokensByOwner.filter(wallet => wallet.name == 'OLD stSOL' || wallet.name == 'stSOL' )
      this.loaderService.show()
    }
  }

  setSelectedActiveStakeAccount(ev) {
    this.selectedActiveStakeAccount = ev.detail.value;
  }
  setSelectedstSOLwallet(ev){
    this.selectedstSOLwallet = ev.detail.value
  }
  joinPool() {
    const selected_activeStakeAccount = this.selectedActiveStakeAccount;
    const selected_stSOL_wallet = this.selectedstSOLwallet.address;
    this.transactionService.depositToStakePOOL(selected_activeStakeAccount, selected_stSOL_wallet)
    
  }
}

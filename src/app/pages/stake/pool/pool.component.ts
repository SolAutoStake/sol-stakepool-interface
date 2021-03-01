import { Component, Input, OnInit } from '@angular/core';
import { faBolt } from '@fortawesome/free-solid-svg-icons';
import { LoaderService } from 'src/app/services/loader.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-pool',
  templateUrl: './pool.component.html',
  styleUrls: ['./pool.component.scss'],
  providers: [LoaderService]
})
export class PoolComponent implements OnInit {
  poolIcon = faBolt
  @Input('currentWallet') wallet;
  selectedActiveStakeAccount
  activeStakeAccounts;
  constructor(
    public loaderService: LoaderService,
    private walletService: WalletService,
    private transactionService: TransactionService
    ) { }

    async ngOnInit() {
      this.wallet = this.walletService.walletController ? this.walletService.walletController.publicKey : null;
      if(this.wallet){
        const stakeAccounts = await this.walletService.getStakeAccountsByOwner().toPromise();

      }
      this.walletService.currentWallet$.subscribe(async (wallet) => {
        this.wallet = wallet
        const stakeAccounts = await this.walletService.getStakeAccountsByOwner().toPromise();
        this.activeStakeAccounts = stakeAccounts.filter((acc: any) =>acc.account.data.parsed.type == 'delegated')
      })
     }
     setSelectedActiveStakeAccount(ev){
      this.selectedActiveStakeAccount = ev.detail.value;
    }
    joinPool(){
      const activeAccountToJoin = this.selectedActiveStakeAccount.account;
      this.transactionService.depositToStakePOOL(activeAccountToJoin)
    }
}

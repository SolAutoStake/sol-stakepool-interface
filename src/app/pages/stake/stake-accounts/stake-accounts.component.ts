import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { WalletService } from 'src/app/services/wallet.service';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { UtilsService } from 'src/app/services/utils.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { LoaderService } from 'src/app/services/loader.service';
@Component({
  selector: 'app-stake-accounts',
  templateUrl: './stake-accounts.component.html',
  styleUrls: ['./stake-accounts.component.scss'],
  providers: [LoaderService]
})
export class StakeAccountsComponent implements OnInit {
  stakeAccIcon = faUsers;
  public solBalance = null
  public usdBalance = null;
  LAMPORTS_PER_SOL =LAMPORTS_PER_SOL;
  constructor(
    public loaderService: LoaderService,
    private walleService:WalletService, 
    public utilsService:UtilsService,
    private transactionService:TransactionService
    ) { }
  stakeAccounts$: Observable<any> = null;
  async ngOnInit() {
    this.loaderService.show()
    this.stakeAccounts$ = this.walleService.getStakeAccountsByOwner()
    this.loaderService.hide()
    console.log('stake acc cp init')
    this.walleService.switchNetworkSubject.subscribe(()=>{
      this.stakeAccounts$ = this.walleService.getStakeAccountsByOwner()
    })
   

    this.stakeAccounts$.subscribe(v =>{
      console.log(v);
      this.getstakeActive()
    })
  

  }
  async usdPrice(sol){
    return this.utilsService.solanaUsdPrice(sol);
  }
  // todo - add UI to get amound of sol
  withdrawFundsFromStakeAcc(stakeAccount){
    console.log(stakeAccount)
    const pubKey = new PublicKey(stakeAccount.pubkey);
    const sol = 0.5 * LAMPORTS_PER_SOL;
    this.transactionService.withdrawFromStakeAccount(pubKey, sol);
  }
  async getstakeActive(pubkey?){
   const res = await this.walleService.con.getStakeActivation(
    new PublicKey("uiT7UEeGrJbNzzjTz9VN5bpTqLvZzU219BvDCF7LRsj"),
    );
    console.log(res)
  }
  // remove funds from stake account
  undelegate(stakeAccount){
    const pubKey = new PublicKey(stakeAccount.pubkey);
    this.transactionService.undelegateFromVoteAccount(pubKey);
  }
}

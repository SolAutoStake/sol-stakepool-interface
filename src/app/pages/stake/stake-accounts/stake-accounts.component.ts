import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { WalletService } from 'src/app/services/wallet.service';
import { faUsers } from '@fortawesome/free-solid-svg-icons';
import { LAMPORTS_PER_SOL, PublicKey } from '@solana/web3.js';
import { UtilsService } from 'src/app/services/utils.service';
import { TransactionService } from 'src/app/services/transaction.service';
import { LoaderService } from 'src/app/services/loader.service';
import { PopoverController } from '@ionic/angular';
import { CreateStakeAccountPopupComponent } from './create-stake-account-popup/create-stake-account-popup.component';
@Component({
  selector: 'app-stake-accounts',
  templateUrl: './stake-accounts.component.html',
  styleUrls: ['./stake-accounts.component.scss'],
  providers: [LoaderService]
})
export class StakeAccountsComponent implements OnChanges {
  @Input('currentWallet') wallet;
  stakeAccIcon = faUsers;
  public solBalance = null
  public usdBalance = null;
  LAMPORTS_PER_SOL = LAMPORTS_PER_SOL;
  constructor(
    public loaderService: LoaderService,
    private walletService: WalletService,
    public utilsService: UtilsService,
    private transactionService: TransactionService,
    public popoverController: PopoverController
  ) { }
  stakeAccounts: Account[] = null;

  ngOnChanges(): void {
    //Called before any other lifecycle hook. Use it to inject dependencies, but avoid any serious work here.
    //Add '${implements OnChanges}' to the class.
    if (this.wallet) {
      console.log(this.wallet);
      this.getStakeAccount()
    }
  }
  async getStakeAccount() {
    this.stakeAccounts = await this.walletService.getStakeAccountsByOwner().toPromise()

    // this.transactionService.depositToStakePOOL('57W1qLmSGavT6zdVDxFSk1pzVj7621RESpKhKZp5CCyw');
  }
  async usdPrice(sol) {
    return this.utilsService.solanaUsdPrice(sol);
  }
  // todo - add UI to get amound of sol
  withdrawFundsFromStakeAcc(stakeAccount) {
    console.log(stakeAccount)
    const pubKey = new PublicKey(stakeAccount.pubkey);
    const sol = 0.5 * LAMPORTS_PER_SOL;
    this.transactionService.withdrawFromStakeAccount(pubKey, sol);
  }
  async getstakeActive() {
    //  const res = await this.walleService.con.getStakeActivation(
    //   new PublicKey("uiT7UEeGrJbNzzjTz9VN5bpTqLvZzU219BvDCF7LRsj"),
    //   );
    //   console.log(res)
  }
  async openNewStakeAccountPopup() {
    const popover = await this.popoverController.create({
      component: CreateStakeAccountPopupComponent,
      cssClass: "transfer-token-popup",
      animated: true
    });
    return await popover.present();
  }
  // remove funds from stake account
  undelegate(stakeAccount) {
    const pubKey = new PublicKey(stakeAccount.pubkey);
    this.transactionService.undelegateFromVoteAccount(pubKey);
  }
}

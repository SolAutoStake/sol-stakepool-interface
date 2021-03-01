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
import { DelegatePopupComponent } from './delegate-popup/delegate-popup.component';
import { WithdrawFromStakeAccountPopupComponent } from './withdraw-from-stake-account-popup/withdraw-from-stake-account-popup.component';
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


  ngOnChanges() {
    if (this.wallet) {
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

  async openDelegatePopup(stakeAccount) {
    const popover = await this.popoverController.create({
      component: DelegatePopupComponent,
      cssClass: "transfer-token-popup",
      animated: true,
      componentProps: { stakeAccount }
    });
    return await popover.present();
  }


  async openWithdawPopup(stakeAccount) {
    const popover = await this.popoverController.create({
      component: WithdrawFromStakeAccountPopupComponent,
      cssClass: "transfer-token-popup",
      animated: true,
      componentProps: { stakeAccount }
    });
    return await popover.present();
  }

}

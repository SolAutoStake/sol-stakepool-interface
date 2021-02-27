import { Component, Input, OnChanges, OnInit } from '@angular/core';
import { WalletService } from 'src/app/services/wallet.service';
import { faList } from '@fortawesome/free-solid-svg-icons';

import { LoaderService } from 'src/app/services/loader.service';
import { PopoverController } from '@ionic/angular';
import { DelegatePopupComponent } from './delegate-popup/delegate-popup.component';

@Component({
  selector: 'app-validator-list',
  templateUrl: './validator-list.component.html',
  styleUrls: ['./validator-list.component.scss'],
  providers: [LoaderService]
})
export class ValidatorListComponent implements OnChanges {
  @Input('currentWallet') wallet;

  listIcon = faList;
  public validatorsData = null
  public promotedValidator = null
  public searchTerm = '';
  constructor(
    public popoverController: PopoverController,
    public loaderService: LoaderService,
    private walleService: WalletService
  ) { }


  ngOnChanges() {
    if (this.wallet) {
      this.pullValidatorsInfo()
    }

  }

  async pullValidatorsInfo() {
    this.loaderService.show()
    // this.validatorsData = await this.validatorsInfoService.getValidatorsInfo().toPromise();
    // this.promotedValidator = await this.validatorsInfoService.getKeybasePubkey(this.validatorsData[0].name).toPromise();
    this.loaderService.hide()
  }
  async openDelagatePopup(selectedValidator) {
    const popover = await this.popoverController.create({
      component: DelegatePopupComponent,
      cssClass: "transfer-token-popup",
      animated: true,
      componentProps: { selectedValidator }
    });
    return await popover.present();
  }

  //TODO - add UI or amount to delegate
  async delegate(selected) {
    // this.transactionService.createStakeAccount(0.1);
    // const authorized = this.walleService.acc
    // const con = this.walleService.con

    // try {

    // const minimumAmount = await con.getMinimumBalanceForRentExemption(
    //   StakeProgram.space,
    // );

    // const newStakeAccount = new Account();
    // let createAndInitialize = StakeProgram.createAccount({
    //   fromPubkey: authorized.publicKey,
    //   stakePubkey: newStakeAccount.publicKey,
    //   authorized: new Authorized(authorized.publicKey, authorized.publicKey),
    //   lockup: new Lockup(0, 0, new PublicKey(0)),
    //   lamports: minimumAmount + 2 * LAMPORTS_PER_SOL,
    // });

    // await sendAndConfirmTransaction(
    //   con,
    //   createAndInitialize,
    //   [authorized, newStakeAccount],
    //   {
    //     preflightCommitment: 'singleGossip',
    //     commitment: 'singleGossip',
    //   },
    // );
    // const voteAccounts = await con.getVoteAccounts();
    // const voteAccount = voteAccounts.current.concat(
    //   voteAccounts.delinquent,
    // )[0];
    // console.log(voteAccounts,voteAccount, selected);
    // const votePubkey = new PublicKey(selected.vote_account);
    // let delegation = StakeProgram.delegate({
    //   stakePubkey: newStakeAccount.publicKey,
    //   authorizedPubkey: authorized.publicKey,
    //   votePubkey,
    // });
    // const tx= await sendAndConfirmTransaction(con, delegation, [authorized], {
    //   preflightCommitment: 'singleGossip',
    //   commitment: 'singleGossip',
    // });

    // console.log(authorized, tx)
    // } catch (error) {
    //     console.error(error);
    // }
    // console.log(selected)
  }
}

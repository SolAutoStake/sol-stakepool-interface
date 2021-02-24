import { Component, OnInit } from '@angular/core';
import { Observable } from 'rxjs';
import { ValidatorsInfoService } from 'src/app/services/validators-info.service';
import { WalletService } from 'src/app/services/wallet.service';
import { faCheck, faList, faWallet } from '@fortawesome/free-solid-svg-icons';
import { ApiService } from 'src/app/services/api.service';
import { Account, Authorized, Connection, CreateStakeAccountParams, DelegateStakeParams, LAMPORTS_PER_SOL, Lockup, PublicKey, sendAndConfirmTransaction, StakeProgram } from '@solana/web3.js';
import { TransactionService } from 'src/app/services/transaction.service';
import { LoaderService } from 'src/app/services/loader.service';
import { PopoverController } from '@ionic/angular';
import { DelegatePopupComponent } from './delegate-popup/delegate-popup.component';

@Component({
  selector: 'app-validator-list',
  templateUrl: './validator-list.component.html',
  styleUrls: ['./validator-list.component.scss'],
  providers: [LoaderService]
})
export class ValidatorListComponent implements OnInit {
  listIcon = faList;
  public validatorsData = null
  public searchTerm = '';
  constructor(
    public popoverController: PopoverController,
    public loaderService: LoaderService,
    private walleService: WalletService,
    private validatorsInfoService: ValidatorsInfoService,
    private transactionService: TransactionService
  ) { }


  public getPromotedValidator = null;
  async ngOnInit() {
    this.walleService.switchNetworkSubject.subscribe(async () => {
      this.pullValidatorsInfo()
    })
  }

  async pullValidatorsInfo() {
    this.loaderService.show()
    this.validatorsData = await this.validatorsInfoService.getValidatorsInfo().toPromise()
    console.log(this.validatorsData)
    this.loaderService.hide()
  }
  async openDelagatePopup(selectedValidator) {
    const popover = await this.popoverController.create({
      component: DelegatePopupComponent,
      cssClass: "transfer-token-popup",
      animated: true,
      componentProps: {selectedValidator}
    });
    return await popover.present();
  }
  //TODO - add UI or amount to delegate
  async delegate(selected) {
    this.transactionService.createStakeAccount(0.1);
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

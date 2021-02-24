import { Component, Input, OnInit, ViewChild } from '@angular/core';
import { IonInput, PopoverController } from '@ionic/angular';
import { LAMPORTS_PER_SOL, PublicKey, StakeProgram } from '@solana/web3.js';
import { TransactionService } from 'src/app/services/transaction.service';
import { WalletService } from 'src/app/services/wallet.service';

@Component({
  selector: 'app-delegate-popup',
  templateUrl: './delegate-popup.component.html',
  styleUrls: ['./delegate-popup.component.scss']
})
export class DelegatePopupComponent implements OnInit {
  @Input() selectedValidator
  public stakeAccounts;
  public selectedStakeAcc = null;
  LAMPORTS_PER_SOL = LAMPORTS_PER_SOL;
  constructor(
    private walleService: WalletService, 
    private popoverController: PopoverController,
    private transactionService: TransactionService
    ) { 
  }
  setActiveAccount(ev){
    this.selectedStakeAcc = ev.detail.value;
    console.log(this.selectedStakeAcc)
  }
  async ngOnInit() {
    console.log(this.selectedValidator);
    this.stakeAccounts = await this.walleService.getStakeAccountsByOwner().toPromise()
  }
  closePopup(){
    this.popoverController.dismiss();
  }
  startDelegate(){
    const votePubkey = new PublicKey(this.selectedValidator.vote_account);
    const stakePubkey = new PublicKey(this.selectedStakeAcc.publicKey);
    const authorized = this.walleService.acc

    let delegation = StakeProgram.delegate({
      stakePubkey,
      authorizedPubkey: authorized.publicKey,
      votePubkey,
    });
    let tx = StakeProgram.delegate({
        stakePubkey,
        authorizedPubkey: authorized.publicKey,
        votePubkey,
      });
    // this.transactionService.delegate()
  }
}

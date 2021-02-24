import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { WalletService } from 'src/app/services/wallet.service';
import { PopoverController } from '@ionic/angular';
import { Account, Cluster } from '@solana/web3.js';
import { LocalDataService } from 'src/app/services/local-data.service';

@Component({
  selector: 'app-connect-wallet-popup',
  templateUrl: './connect-wallet-popup.component.html',
  styleUrls: ['./connect-wallet-popup.component.scss'],
})
export class ConnectWalletPopupComponent implements OnInit {
  closeIcon = faTimes;
  isSubmitted: boolean = false;
  mnemonicForm: FormGroup;
  Mnemonic: string;
  accounts: any = null;
  derivationPath = 'bip44Change';
  constructor(
    private walletService: WalletService,
    private fb: FormBuilder,
    public popoverController: PopoverController
  ) { }

  ngOnInit(): void {
    this.mnemonicForm = this.fb.group({
      mnemonic: ['', Validators.required],
    })
  }
  async connectWallet() {
    this.isSubmitted = true;
    const Mnemonic = this.mnemonicForm.controls.mnemonic.value;
    try {
      this.walletService.connectWallet(Mnemonic);
      this.closePopup();
    } catch (error) {
      console.error(error);
    }
    this.isSubmitted = false;
  }

  restore(){
    // this.closePopup();
  }
  async closePopup() {
    this.popoverController.dismiss()
  }
  onDerivableChange(ev){
    this.derivationPath = ev.detail.value
    console.log(this.derivationPath);
    this.connectWallet()
  }
}

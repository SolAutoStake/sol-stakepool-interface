import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { WalletService } from 'src/app/services/wallet.service';
import { PopoverController } from '@ionic/angular';
import { Cluster } from '@solana/web3.js';

@Component({
  selector: 'app-connect-wallet-popup',
  templateUrl: './connect-wallet-popup.component.html',
  styleUrls: ['./connect-wallet-popup.component.scss'],
})
export class ConnectWalletPopupComponent implements OnInit {
  closeIcon = faTimes;
  isSubmitted: boolean = false;
  mnemonicForm: FormGroup;
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
    const Mnemonic: string = this.mnemonicForm.controls.mnemonic.value;
    const cluster: Cluster = this.walletService.getCurrentCluster();
    try {
      await this.walletService.connectWallet(Mnemonic, cluster)
      this.closePopup();
    } catch (error) {
      console.error(error);
    }
    this.isSubmitted = false;
  }
  async closePopup() {
    this.popoverController.dismiss()
  }
}

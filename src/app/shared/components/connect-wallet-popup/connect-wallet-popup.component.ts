import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { WalletService } from 'src/app/services/wallet.service';
@Component({
  selector: 'app-connect-wallet-popup',
  templateUrl: './connect-wallet-popup.component.html',
  styleUrls: ['./connect-wallet-popup.component.scss']
})
export class ConnectWalletPopupComponent implements OnInit {
  closeIcon = faTimes;
  isSubmitted: boolean = false;
  mnemonicForm: FormGroup;

  constructor(private walletService: WalletService, private fb: FormBuilder) { }

  ngOnInit(): void {
    this.mnemonicForm = this.fb.group({
      mnemonic: ['', Validators.required],
    })
  }
  async connectWallet() {
    this.isSubmitted = true;
    const Mnemonic = this.mnemonicForm.controls.mnemonic.value;
    await this.walletService.connectWallet({ cluster: this.walletService.clusterUrl('dev'), Mnemonic }).toPromise();
    this.isSubmitted = false;
    console.log(this.isSubmitted);
  }
}

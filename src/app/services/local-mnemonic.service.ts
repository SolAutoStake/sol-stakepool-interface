import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalMnemonicService {

  constructor() { }
  getMnemonic(): String {
    return window.localStorage['Mnemonic'];
  }

  saveMnemonic(Mnemonic: String) {
    window.localStorage['Mnemonic'] = Mnemonic;
  }

  destroyMnemonic() {
    window.localStorage.removeItem('Mnemonic');
  }
}

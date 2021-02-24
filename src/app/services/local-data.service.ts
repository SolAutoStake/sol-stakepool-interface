import { Injectable } from '@angular/core';
import { Account } from '@solana/web3.js';
import bs58 from 'bs58';
import * as bip32 from 'bip32';
import * as nacl from 'tweetnacl';
import { derivePath } from 'ed25519-hd-key';
import { UtilsService } from './utils.service';
@Injectable({
  providedIn: 'root'
})
export class LocalDataService {

  constructor(private utilsService: UtilsService) { }
  DERIVATION_PATH = {
    deprecated: undefined,
    bip44: 'bip44',
    bip44Change: 'bip44Change',
  };
  
  getProp(key: string): string {
    return window.localStorage[key];
  }

  saveProp(key: string, value: any) {
    window.localStorage[key] = value;
  }

  destroyProp(key) {
    window.localStorage.removeItem(key);
  }

  async getAccountFromSeed2(Mnemonic): Promise<Account>{
    const seed = await this.utilsService.mnemonicToSeed(Mnemonic);
    const derivedSeed = bip32.fromSeed(seed).derivePath(`m/44'/501'/0'/0'`).privateKey;
    return new Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
  }


  // not in use
  async getAccountFromSeed(
    Mnemonic,
    walletIndex = 0,
    dPath = undefined,
    accountIndex = 0,
  ) {
    const seed = await this.utilsService.mnemonicToSeed(Mnemonic);
    const derivedSeed = this.deriveSeed(seed, walletIndex, this.DERIVATION_PATH[dPath], accountIndex);
    return new Account(nacl.sign.keyPair.fromSeed(derivedSeed).secretKey);
  }
  deriveSeed(seed, walletIndex, derivationPath, accountIndex) {
    switch (derivationPath) {
      case this.DERIVATION_PATH.deprecated:
        const path = `m/501'/${walletIndex}'/0/${accountIndex}`;
        return bip32.fromSeed(seed).derivePath(path).privateKey;
      case this.DERIVATION_PATH.bip44:
        const path44 = `m/44'/501'/${walletIndex}'`;
        return derivePath(path44, seed).key;
      case this.DERIVATION_PATH.bip44Change:
        const path44Change = `m/44'/501'/${walletIndex}'/0'`;
        return derivePath(path44Change, seed).key;
      default:
        throw new Error(`invalid derivation path: ${derivationPath}`);
    }
  }

}

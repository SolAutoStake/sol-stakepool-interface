import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LocalDataService } from './local-data.service';
import { ToastMessageService } from './toast-message.service';

import {
  Account,
  Connection,
  LAMPORTS_PER_SOL,
  Cluster,
  clusterApiUrl,
} from '@solana/web3.js';
import { Wallet } from '../models';
import { PriceFeedService } from './price-feed.service';

import * as bip32 from 'bip32';
import * as nacl from 'tweetnacl'

async function generateMnemonicAndSeed() {
  const bip39 = await import('bip39');
  const mnemonic = bip39.generateMnemonic(128);
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return { mnemonic, seed: Buffer.from(seed).toString('hex') };
}
async function mnemonicToSeed(mnemonic) {
  const bip39 = await import('bip39');
  if (!bip39.validateMnemonic(mnemonic)) {
    throw new Error('Invalid seed words');
  }
  const seed = await bip39.mnemonicToSeed(mnemonic);
  return Buffer.from(seed);
}
@Injectable({
  providedIn: 'root'
})
export class WalletService {
  public con: Connection = null;
  public acc: Account = null;
  private currentWalletSubject = new BehaviorSubject<Wallet>({} as Wallet);
  public currentWallet$ = this.currentWalletSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  public switchNetworkSubject = new BehaviorSubject<Cluster>('mainnet-beta' as Cluster);

  constructor(
    private apiService: ApiService,
    private priceFeedService: PriceFeedService,
    private toastMessageService: ToastMessageService,
    private localDataService: LocalDataService
  ) {
  }
  public getCurrentWallet(): Wallet {
    return this.currentWalletSubject.value;
  }
  public getCurrentCluster(): Cluster {
    return this.switchNetworkSubject.value;
  }
  // catch error
  private formatErrors(error: any) {
    this.toastMessageService.msg.next({ message: error.message, segmentClass: 'toastError' })
    return throwError(error);
  }
  // Verify Mnemonic in localstorage with solana blockchain
  // This runs once on application startup.
  public async populate() {
    // If Mnemonic validated, attempt connect wallet

    if (this.localDataService.getProp('cluster') && this.localDataService.getProp('Mnemonic')) {
      const cluster: any = this.localDataService.getProp('cluster');
      const Mnemonic: string = this.localDataService.getProp('Mnemonic').toString();

      // set network subject based on local storage
      this.switchNetworkSubject.next(cluster)
      await this.connectWallet(Mnemonic, cluster);
    } else {
      // Remove any potential remnants of previous wallet states
      this.purgeAuth();
    }
  }

  private purgeAuth() {
    // Remove local stored wallet credentials from localstorage
    this.localDataService.destroyProp('cluster');
    this.localDataService.destroyProp('Mnemonic');
    this.currentWalletSubject.next(null);
  }


  public async connectWallet(Mnemonic: string, cluster: Cluster): Promise<any> {
    try {
      // connect to a cluster
      this.con = await new Connection(clusterApiUrl(cluster));
      let walletIndex = 0;
      let accountIndex = 0;
      
      // validate Mnemonic

      const seed = await mnemonicToSeed(Mnemonic);
      const derivedSeed = bip32.fromSeed(seed).derivePath(`m/501'/${walletIndex}'/0/${accountIndex}`).privateKey; // this line fail

      const sign = nacl.sign.keyPair.fromSeed(derivedSeed).secretKey;
      // // find wallet
      this.acc = await new Account(sign);

      const accBalance = await this.con.getBalance(this.acc.publicKey) / LAMPORTS_PER_SOL;
      const address = await this.acc.publicKey.toBase58();
      const wallet: Wallet = {
        balance: accBalance,
        address
      }
      this.localDataService.saveProp('cluster', this.getCurrentCluster());
      this.localDataService.saveProp('Mnemonic', Mnemonic);

      this.currentWalletSubject.next(wallet);
    } catch (error) {
      console.error(error)
      catchError((error) => this.formatErrors(error));
    }
  }
}

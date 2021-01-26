import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LocalDataService } from './local-data.service';
import { ToastMessageService } from './toast-message.service';
import * as bip39 from 'bip39';
import * as Buffer from "Buffer";

import {
  Account,
  Connection,
  BpfLoader,
  BPF_LOADER_PROGRAM_ID,
  PublicKey,
  LAMPORTS_PER_SOL,
  SystemProgram,
  TransactionInstruction,
  Transaction,
  sendAndConfirmTransaction,
  AccountInfo,
  Cluster,
  clusterApiUrl,
} from '@solana/web3.js';
import { Wallet } from '../models';
import { PriceFeedService } from './price-feed.service';



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
    // private transactionService: TransactionService,
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
  public populate() {
    // If Mnemonic validated, attempt connect wallet

    if (this.localDataService.getProp('cluster') && this.localDataService.getProp('Mnemonic')) {
      const cluster: any = this.localDataService.getProp('cluster');
      const Mnemonic: string = this.localDataService.getProp('Mnemonic').toString();

      // set network subject based on local storage
      this.switchNetworkSubject.next(cluster)
      this.connectWallet( Mnemonic, cluster );
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

      // validate Mnemonic
      const seedBuffer: Buffer = await bip39.mnemonicToSeedSync(Mnemonic);

      // find wallet
      this.acc = await new Account(seedBuffer);

      // const firstSlot = await this.con.getSlot('root');
      // const currentSlot = await this.con.getSlot('recent');
      // const blocktime = await con.getBlockTime(firstSlot);
      // const blocktime2 = await con.getBlockTime(currentSlot);
      // const accInfo = await this.con.getConfirmedSignaturesForAddress(this.acc.publicKey, firstSlot, currentSlot);
      // const accInfo2 = await this.con.getConfirmedSignaturesForAddress2(this.acc.publicKey);
      // const cntx = await this.con.getConfirmedTransaction(accInfo2[0].signature);
      // console.log('acc info:', accInfo, accInfo2, cntx);
      // const confirmTx = await con. getParsedConfirmedTransaction('3NSv4qQnfXbfXAcvXiNPv3VQBu1DEcigW4rvcamsqvmQqkCVxR1R3qANLJKQ6sEai1wWSn39ETrfE9gQispWt5wR');
      // console.log('confirm tx', confirmTx)
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
      catchError((error) => this.formatErrors(error));
    }
  }
}

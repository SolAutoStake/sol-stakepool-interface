import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LocalDataService } from './local-data.service';
import { ToastMessageService } from './toast-message.service';

import {
  Account,
  Connection,
  clusterApiUrl,
  PublicKey,
  ConfirmedSignatureInfo,
  ConfirmedTransaction,
  LAMPORTS_PER_SOL,
  Cluster,
} from '@solana/web3.js';

export type ENV = "mainnet-beta" | "testnet" | "devnet" | "localnet";

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  public ENDPOINTS = [
    {
      name: "mainnet-beta" as ENV,
      endpoint: "https://solana-api.projectserum.com/",
    },
    { name: "testnet" as ENV, endpoint: clusterApiUrl("testnet") },
    { name: "devnet" as ENV, endpoint: clusterApiUrl("devnet") },
    // { name: "localnet" as ENV, endpoint: "http://127.0.0.1:8899" },
  ];


  public con: Connection = null;
  public acc: Account = null;
  private currentWalletSubject = new Subject<Account>()
  public currentWallet$: Observable<Account> = this.currentWalletSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  public switchNetworkSubject = new BehaviorSubject<Cluster>('mainnet-beta' as Cluster);

  public getCurrentCluster(): Cluster {
    return this.switchNetworkSubject.value;
  }

  constructor(
    private apiService: ApiService,
    private toastMessageService: ToastMessageService,
    private localDataService: LocalDataService
  ) {

  }
  // catch error
  private formatErrors(error: any) {
    this.toastMessageService.msg.next({ message: error, segmentClass: 'toastError' })
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
  async getWalletHistory(walletPubKey: PublicKey) {
    try {
      const signatures: ConfirmedSignatureInfo[] = await this.con.getConfirmedSignaturesForAddress2(walletPubKey);
      let rd: any[] = [];
      let walletHistory = []
      signatures.forEach(async signature => {
        rd.push(this.con.getConfirmedTransaction(signature.signature));
      });
      // const history: ConfirmedTransaction = await Promise.all([this.walletService.con.getConfirmedTransaction(signatures)]);
      const records: ConfirmedTransaction[] = await Promise.all(rd);
      records.forEach((record, i) => {
        const from = record?.transaction?.instructions[0]?.keys[0]?.pubkey.toBase58() || null;
        const to = record.transaction?.instructions[0]?.keys[1]?.pubkey.toBase58() || null;;
        const amount = (record.meta?.postBalances[1] - record.meta?.preBalances[1]) / LAMPORTS_PER_SOL || null;
        walletHistory.push({ signature: signatures[i].signature, block: record.slot, amount, from, to } || null)
      });
      return walletHistory;
    } catch (error) {
      // this.toastMessageService.msg.next({ message: 'failed to retrieve transaction history', segmentClass: 'toastError' })
    }
  }


  public async connectWallet(Mnemonic: string, derivationPath?: string): Promise<any> {
    this.con = await new Connection(clusterApiUrl(this.switchNetworkSubject.value));
    try {
      this.acc = await this.localDataService.getAccountFromSeed(Mnemonic)
      this.localDataService.saveProp('cluster', this.switchNetworkSubject.value);
      this.localDataService.saveProp('Mnemonic', Mnemonic);

      this.currentWalletSubject.next(this.acc);
      console.log(this.acc)
    } catch (error) {
      console.error(error)
      catchError((error) => this.formatErrors(error));
    }
  }

  public getStakeAccountsByOwner(): Observable<any> {
    var raw = {
      "jsonrpc": "2.0",
      "id": 1,
      "method": "getProgramAccounts",
      "params": [
        "Stake11111111111111111111111111111111111111",

        {
          "encoding": "jsonParsed",
          "filters": [
            {
              "memcmp": {
                "offset": 12,
                "bytes": this.acc.publicKey.toBase58()
              }
            }
          ]
        }
      ]
    }
    return this.apiService.post(clusterApiUrl(this.switchNetworkSubject.value), raw).pipe(
      map((data) => {
        return data.result;
      }),
      catchError((error) => this.formatErrors(error))
    );
  }

}
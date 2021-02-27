import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { LocalDataService } from './local-data.service';
import { ToastMessageService } from './toast-message.service';

import {
  Connection,
  clusterApiUrl,
  PublicKey,
  ConfirmedSignatureInfo,
  ConfirmedTransaction,
  LAMPORTS_PER_SOL,
  AccountInfo
} from '@solana/web3.js';
import Wallet from "@project-serum/sol-wallet-adapter";

export type ENV = "mainnet-beta" | "testnet" | "devnet" | "localnet";

@Injectable({
  providedIn: 'root'
})
export class WalletService {

  protected TOKEN_PROGRAM_ID: PublicKey = new PublicKey(
    "TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA"
  );
  public ENDPOINTS = [
    {
      name: "mainnet-beta" as ENV,
      endpoint: "https://solana-api.projectserum.com/",
    },
    { name: "testnet" as ENV, endpoint: clusterApiUrl("testnet") },
    { name: "devnet" as ENV, endpoint: clusterApiUrl("devnet") },
    // { name: "localnet" as ENV, endpoint: "http://127.0.0.1:8899" },
  ];
  public WALLET_PROVIDERS = [
    { name: "sollet.io", url: "https://www.sollet.io" },
    { name: 'bonfida', url: 'https://bonfida.com/wallet' }
  ];

  public con: Connection = null;

  public walletController = null
  private currentWalletSubject = new Subject<PublicKey>();
  public currentWallet$: Observable<PublicKey> = this.currentWalletSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  public networkSubject = new BehaviorSubject<any>(this.ENDPOINTS[0] as any);
  public providerSubject = new BehaviorSubject<any>(this.WALLET_PROVIDERS[0] as any);


  constructor(
    private apiService: ApiService,
    private toastMessageService: ToastMessageService
  ) {
    this.networkSubject.subscribe(async val => {
      this.con = await new Connection(this.networkSubject.value.endpoint);
      if (this.walletController) {
        await this.disconnectFromWallet()
      }
    });
  }
  // catch error
  private formatErrors(error: any) {
    this.toastMessageService.msg.next({ message: error, segmentClass: 'toastError' })
    return throwError(error);
  }

  async connectWithProvider() {
    const network = this.networkSubject.value
    const walletProvider = this.providerSubject.value;
    this.walletController = new Wallet(walletProvider.url, network.endpoint);
    this.walletController.on('connect', publicKey => {
      this.currentWalletSubject.next(publicKey)
      this.toastMessageService.msg.next({ message: 'wallet connected', segmentClass: 'toastInfo' });
    });
    this.walletController.on('disconnect', () => {
      this.toastMessageService.msg.next({ message: 'wallet disconnected', segmentClass: 'toastInfo' })
    });
    await this.walletController.connect();
  }
  async getTokensOwner() {
    const tokenAccounts = await this.con.getParsedTokenAccountsByOwner(this.walletController.publicKey, {
      programId: this.TOKEN_PROGRAM_ID
    });

    const tokenAccountsFiltered = tokenAccounts.value.map(wallet => {
      const account = wallet.account
      return {
        name: this.getHardCodedTokenName(account.data.parsed.info.mint),
        amount: account.lamports / LAMPORTS_PER_SOL,
        tokenAmount: account.data.parsed.info.tokenAmount || null,
        isNative: account.data.parsed.info.isNative
      }
    });

    return { tokenAccounts, tokenAccountsFiltered }
  }
  private getHardCodedTokenName(name) {
    switch (name) {
	  // LEGACY
	  case '21ofzqmgounc8bX4CK6j3Ff4zjvX6GmRykUnJAU96zKz':
		return 'OLD stSOL';
	  case '3XrStMayUhNpsFJzmKyynC99fs1Ppbenpj3kpC77EQEh':
		return 'OLD METALP';
	  // CURRENT
      case '9ipM64eAyTtV5mY27qrdAe5x143QfcjuDRWp72EZBeez':
        return 'stSOL'
      case 'EYbFdPKbRa3MxGxQy9YgFSFs7448Gq17fWRYSeNhVNtq':
        return 'METALP'

      default:
        return name;
    }
  }
  private async disconnectFromWallet() {
    await this.walletController.disconnect()
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
      const records: ConfirmedTransaction[] = await Promise.all(rd);
      records.forEach((record, i) => {
        const from = record?.transaction?.instructions[0]?.keys[0]?.pubkey.toBase58() || null;
        const to = record.transaction?.instructions[0]?.keys[1]?.pubkey.toBase58() || null;;
        const amount = (record.meta?.postBalances[1] - record.meta?.preBalances[1]) / LAMPORTS_PER_SOL || null;
        walletHistory.push({ signature: signatures[i].signature, block: record.slot, amount, from, to } || null)
      });
      return walletHistory;
    } catch (error) {
      console.error(error)
      this.toastMessageService.msg.next({ message: 'failed to retrieve transaction history', segmentClass: 'toastError' })
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
                "bytes": this.walletController.publicKey.toBase58()
              }
            }
          ]
        }
      ]
    }
    return this.apiService.post(this.networkSubject.value.endpoint, raw).pipe(
      map((data) => {
        return data.result;
      }),
      catchError((error) => this.formatErrors(error))
    );
  }

}
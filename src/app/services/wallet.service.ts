import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, distinctUntilChanged, map } from 'rxjs/operators';
import { ApiService } from './api.service';

enum Cluster {
  'MB' = 'https://api.mainnet-beta.solana.com',
  'dev' = 'https://devnet.solana.com',
  'test' = 'https://testnet.solana.com'
}
@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private currentWalletSubject = new BehaviorSubject<any>({} as any);
  public currentWallet = this.currentWalletSubject
    .asObservable()
    .pipe(distinctUntilChanged());

  public clusterUrl = (env = 'MB') =>{
    console.log(Cluster[env]);
    return Cluster[env]
  }
  constructor(private apiService: ApiService) { }

  // catch error
  private formatErrors(error: any) {
    return throwError(error);
  }
  connectWallet(credentials): Observable<any> {
    return this.apiService.get(`/wallet/accountInfo`, credentials).pipe(
      map((data) => {
        this.currentWalletSubject.next(data);
      }),
      catchError((error) => this.formatErrors(error))
    );
  }
}

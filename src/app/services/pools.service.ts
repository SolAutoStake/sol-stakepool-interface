import { Injectable } from '@angular/core';
import { Token, MintLayout, AccountLayout } from "@solana/spl-token";
import { WalletService } from './wallet.service';
@Injectable({
  providedIn: 'root'
})
export class PoolsService {

  constructor(private walletService: WalletService) {
   }
}

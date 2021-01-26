import { Injectable } from '@angular/core';
import { ApiService } from './api.service';

@Injectable({
  providedIn: 'root'
})
export class PriceFeedService {
  protected endpoint = 'https://api.coingecko.com/api/v3/simple/price';

  constructor(private apiService: ApiService) { 
    this.getPriceList();
  }
  async getPriceList(tokens?: string[]) {
    const rate = await this.apiService.get(`${this.endpoint}?ids=solana&vs_currencies=usd`).toPromise();
    console.log(rate);
    return rate;
  }
}

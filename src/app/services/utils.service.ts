import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class UtilsService {

  constructor() { }
  public shortenAddress(address: string, chars = 4): string {
    if(address){
      return `${address.substring(0, chars + 2)}...${address.substring(42 - chars)}`
    }
    return
  }
  public shortenSignature(signature: string, chars = 4): string {
    if(signature){
      return `${signature.substring(0, chars + 2)}...${signature.substring(85 - chars)}`
    }
    return
  }
}

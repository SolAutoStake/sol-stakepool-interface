import { Injectable } from '@angular/core';
import { throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ApiService } from './api.service';
import { ToastMessageService } from './toast-message.service';
import { WalletService } from './wallet.service';

@Injectable({
  providedIn: 'root'
})
export class ValidatorsInfoService {
  
  protected solValidatorsApi = `http://localhost:5001/sol-stake-interface/us-central1/getValidatorInfo`;
  constructor(private apiService:ApiService, private toastMessageService: ToastMessageService, private walleService: WalletService) { }
  private formatErrors(error: any) {
    this.toastMessageService.msg.next({ message: error, segmentClass: 'toastError' })
    return throwError(error);
  }
  getValidatorsInfo(){
    return this.apiService.get(`${this.solValidatorsApi}?network=${this.walleService.networkSubject.value.name}&order=score&limit=100`).pipe(
      map((validatorMetrics) => {
        // Update the currentUser observable
        return validatorMetrics;
      }),
      catchError((error) => this.formatErrors(error))
    );
    
  }
  getKeybasePubkey(validatorUserName){
    return this.apiService.get(`https://keybase.io/_/api/1.0/user/lookup.json?username=${validatorUserName}`).pipe(
      map((validatorMetrics) => {
        return validatorMetrics;
      }),
      catchError((error) => this.formatErrors(error))
    );
  }
}

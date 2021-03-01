import { Component, Input, OnInit } from '@angular/core';
import { TransactionService } from 'src/app/services/transaction.service';

@Component({
  selector: 'app-delegate-popup',
  templateUrl: './delegate-popup.component.html',
  styleUrls: ['./delegate-popup.component.scss']
})
export class DelegatePopupComponent implements OnInit {
  @Input('stakeAccount') stakeAccount;
  sendBtnClicked: boolean = false;
  constructor(private transactionService: TransactionService) { }

  ngOnInit(): void {
  }
  delegate(){
    try {
      this.transactionService.delegate(this.stakeAccount)
      this.sendBtnClicked = true;
    } catch (error) {
      console.warn(error)
    }
  }
}

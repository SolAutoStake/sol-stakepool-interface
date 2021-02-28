import { Component, OnInit } from '@angular/core';

@Component({
  selector: 'app-sell-st-sol-popup',
  templateUrl: './sell-st-sol-popup.component.html',
  styleUrls: ['./sell-st-sol-popup.component.scss']
})
export class SellStSOLPopupComponent implements OnInit {
  sendBtnClicked: boolean = false;
  constructor() { }

  ngOnInit(): void {
  }
  sell_stSOL(){
    try {
      this.sendBtnClicked = true;
    } catch (error) {
      return
    }
  }
}

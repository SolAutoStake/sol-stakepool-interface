import { Component, OnInit } from '@angular/core';
import { faArrowRight } from '@fortawesome/free-solid-svg-icons';
@Component({
  selector: 'app-stake-pool-card',
  templateUrl: './stake-pool-card.component.html',
  styleUrls: ['./stake-pool-card.component.scss']
})
export class StakePoolCardComponent implements OnInit {
  faArrowRight = faArrowRight
  constructor() { }

  ngOnInit(): void {
  }

}

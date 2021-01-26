import { Component, OnInit } from '@angular/core';
import { faCopy } from '@fortawesome/free-regular-svg-icons';
import { UtilsService } from 'src/app/services/utils.service';
@Component({
  selector: 'app-history',
  templateUrl: './history.component.html',
  styleUrls: ['./history.component.scss']
})
export class HistoryComponent implements OnInit {
  copyAddress = faCopy;
  constructor(public utilsService:UtilsService) { }

  ngOnInit(): void {
  }

}

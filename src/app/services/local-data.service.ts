import { Injectable } from '@angular/core';
import { UtilsService } from './utils.service';
@Injectable({
  providedIn: 'root'
})
export class LocalDataService {

  constructor(private utilsService: UtilsService) { }
  getProp(key: string): string {
    return window.localStorage[key];
  }

  saveProp(key: string, value: any) {
    window.localStorage[key] = value;
  }

  destroyProp(key) {
    window.localStorage.removeItem(key);
  }

}

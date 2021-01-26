import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class LocalDataService {

  constructor() { }
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

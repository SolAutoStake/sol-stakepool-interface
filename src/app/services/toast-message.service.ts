import { Injectable } from '@angular/core';
import { ToastController } from "@ionic/angular";
import { Subject } from "rxjs";
import { Toast } from '../models/toast';
@Injectable({
  providedIn: 'root'
})
export class ToastMessageService {
  msg: Subject<Toast> = new Subject<Toast>();
  constructor(
    private toastController: ToastController
  ) {
    this.msg.subscribe((toastData: Toast) => {
        this.presentToast(toastData.message, toastData.segmentClass);    
    });
  }
  async presentToast(text: string, segmentClass: string) {
    const toast = await this.toastController.create({
      cssClass: `toastStyle ${segmentClass}`,
      message: text,
      duration: 2000,
      animated: true
    });
    toast.present();
  }
}

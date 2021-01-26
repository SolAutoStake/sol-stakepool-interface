import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { ConnectWalletPopupComponent, HeaderComponent } from './components';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from '@ionic/angular';
@NgModule({
  declarations: [
    HeaderComponent,
    ConnectWalletPopupComponent,
  ],
  imports: [
    IonicModule,
    CommonModule,
    HttpClientModule,
    FontAwesomeModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
  ],
  exports: [
    IonicModule,
    HttpClientModule,
    FontAwesomeModule,
    HeaderComponent,
    ConnectWalletPopupComponent,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }

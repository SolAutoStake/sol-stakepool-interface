import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import {
  HeaderComponent,
  SearchInputComponent,
  EmptyStateComponent,
  SettingsBoxComponent,
  ConnectWalletPopupComponent
} from './components';
import { RouterModule } from '@angular/router';
import { HttpClientModule } from '@angular/common/http';
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { IonicModule } from '@ionic/angular';

import { FilterPipe } from './pipes/filter.pipe';
import { CopyToClipboardDirective } from './directives/copy-to-clipboard.directive';

@NgModule({
  declarations: [
    FilterPipe,
    HeaderComponent,
    SearchInputComponent,
    ConnectWalletPopupComponent,
    CopyToClipboardDirective,
    EmptyStateComponent,
    SettingsBoxComponent
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
    FilterPipe,
    EmptyStateComponent,
    HeaderComponent,
    SearchInputComponent,
    CopyToClipboardDirective,
    RouterModule,
    FormsModule,
    ReactiveFormsModule
  ]
})
export class SharedModule { }

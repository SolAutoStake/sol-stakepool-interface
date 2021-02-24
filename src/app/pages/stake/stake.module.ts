import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StakeComponent } from './stake.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';
import { ValidatorListComponent } from './validator-list/validator-list.component';
import { StakeAccountsComponent } from './stake-accounts/stake-accounts.component';
import { DelegatePopupComponent } from './validator-list/delegate-popup/delegate-popup.component';



const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: '/home',
  //   pathMatch: 'full'
  // },
  {
    path: '',
    component: StakeComponent
  }
]

@NgModule({
  declarations: [StakeComponent, ValidatorListComponent, StakeAccountsComponent, DelegatePopupComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class StakeModule { }

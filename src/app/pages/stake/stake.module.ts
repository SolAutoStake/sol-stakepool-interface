import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { StakeComponent } from './stake.component';
import { RouterModule, Routes } from '@angular/router';
import { StakePoolCardComponent } from './stake-pool-card/stake-pool-card.component';
import { GuideCardComponent } from './guide-card/guide-card.component';



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
  declarations: [StakeComponent, GuideCardComponent, StakePoolCardComponent],
  imports: [
    CommonModule,
    RouterModule.forChild(routes)
  ]
})
export class StakeModule { }

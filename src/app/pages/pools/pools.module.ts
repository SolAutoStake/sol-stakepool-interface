import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { PoolsComponent } from './pools.component';
import { RouterModule, Routes } from '@angular/router';
import { SharedModule } from 'src/app/shared/shared.module';

const routes: Routes = [
  // {
  //   path: '',
  //   redirectTo: '/home',
  //   pathMatch: 'full'
  // },
  {
    path: '',
    component: PoolsComponent
  }
]

@NgModule({
  declarations: [PoolsComponent],
  imports: [
    CommonModule,
    SharedModule,
    RouterModule.forChild(routes)
  ]
})
export class PoolsModule { }

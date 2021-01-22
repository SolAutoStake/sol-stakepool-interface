import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StakePoolCardComponent } from './stake-pool-card.component';

describe('StakePoolCardComponent', () => {
  let component: StakePoolCardComponent;
  let fixture: ComponentFixture<StakePoolCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ StakePoolCardComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(StakePoolCardComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

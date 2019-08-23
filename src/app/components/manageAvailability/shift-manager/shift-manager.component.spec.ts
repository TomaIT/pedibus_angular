import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ShiftManagerComponent } from './shift-manager.component';

describe('ShiftManagerComponent', () => {
  let component: ShiftManagerComponent;
  let fixture: ComponentFixture<ShiftManagerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ShiftManagerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ShiftManagerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

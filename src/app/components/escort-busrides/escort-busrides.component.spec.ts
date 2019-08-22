import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EscortBusridesComponent } from './escort-busrides.component';

describe('EscortBusridesComponent', () => {
  let component: EscortBusridesComponent;
  let fixture: ComponentFixture<EscortBusridesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EscortBusridesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EscortBusridesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { StateBusrideComponent } from './state-busride.component';

describe('StateBusrideComponent', () => {
  let component: StateBusrideComponent;
  let fixture: ComponentFixture<StateBusrideComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ StateBusrideComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(StateBusrideComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

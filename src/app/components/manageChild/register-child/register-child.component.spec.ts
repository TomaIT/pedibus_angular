import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RegisterChildComponent} from './register-child.component';

describe('RegisterChildComponent', () => {
  let component: RegisterChildComponent;
  let fixture: ComponentFixture<RegisterChildComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RegisterChildComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RegisterChildComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { CreateAvailabilityComponent } from './create-availability.component';

describe('CreateAvailabilityComponent', () => {
  let component: CreateAvailabilityComponent;
  let fixture: ComponentFixture<CreateAvailabilityComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ CreateAvailabilityComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CreateAvailabilityComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

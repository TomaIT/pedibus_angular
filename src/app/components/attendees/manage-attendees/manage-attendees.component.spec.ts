import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ManageAttendeesComponent } from './manage-attendees.component';

describe('ManageAttendeesComponent', () => {
  let component: ManageAttendeesComponent;
  let fixture: ComponentFixture<ManageAttendeesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ManageAttendeesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ManageAttendeesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

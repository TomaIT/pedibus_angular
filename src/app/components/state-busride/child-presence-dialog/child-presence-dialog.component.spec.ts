import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ChildPresenceDialogComponent } from './child-presence-dialog.component';

describe('ChildPresenceDialogComponent', () => {
  let component: ChildPresenceDialogComponent;
  let fixture: ComponentFixture<ChildPresenceDialogComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ChildPresenceDialogComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ChildPresenceDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

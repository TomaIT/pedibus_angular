import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ComunicationComponent } from './comunication.component';

describe('ComunicationComponent', () => {
  let component: ComunicationComponent;
  let fixture: ComponentFixture<ComunicationComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ComunicationComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ComunicationComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

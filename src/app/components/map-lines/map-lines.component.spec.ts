import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { MapLinesComponent } from './map-lines.component';

describe('MapLinesComponent', () => {
  let component: MapLinesComponent;
  let fixture: ComponentFixture<MapLinesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ MapLinesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(MapLinesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { StopBusService } from './stop-bus.service';

describe('StopBusService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: StopBusService = TestBed.get(StopBusService);
    expect(service).toBeTruthy();
  });
});

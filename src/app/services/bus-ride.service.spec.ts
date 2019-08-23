import {TestBed} from '@angular/core/testing';

import {BusRideService} from './bus-ride.service';

describe('BusRideService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: BusRideService = TestBed.get(BusRideService);
    expect(service).toBeTruthy();
  });
});

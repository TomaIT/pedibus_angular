import { TestBed } from '@angular/core/testing';

import { MyRouterService } from './my-router.service';

describe('MyRouterService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: MyRouterService = TestBed.get(MyRouterService);
    expect(service).toBeTruthy();
  });
});

import { TestBed } from '@angular/core/testing';

import { OpenService } from './open.service';

describe('OpenService', () => {
  beforeEach(() => TestBed.configureTestingModule({}));

  it('should be created', () => {
    const service: OpenService = TestBed.get(OpenService);
    expect(service).toBeTruthy();
  });
});

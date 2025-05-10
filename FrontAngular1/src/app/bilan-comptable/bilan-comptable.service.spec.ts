import { TestBed } from '@angular/core/testing';

import { BilanComptableService } from './bilan-comptable.service';

describe('BilanComptableService', () => {
  let service: BilanComptableService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BilanComptableService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});

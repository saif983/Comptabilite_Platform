import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BilanComptableComponent } from './bilan-comptable.component';

describe('BilanComptableComponent', () => {
  let component: BilanComptableComponent;
  let fixture: ComponentFixture<BilanComptableComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [BilanComptableComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(BilanComptableComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

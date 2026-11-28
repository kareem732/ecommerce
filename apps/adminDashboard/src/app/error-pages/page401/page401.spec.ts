import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Page401 } from './page401';

describe('Page401', () => {
  let component: Page401;
  let fixture: ComponentFixture<Page401>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Page401],
    }).compileComponents();

    fixture = TestBed.createComponent(Page401);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

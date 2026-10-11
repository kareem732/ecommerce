import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ResetLinkReceived } from './reset-link-received';

describe('ResetLinkReceived', () => {
  let component: ResetLinkReceived;
  let fixture: ComponentFixture<ResetLinkReceived>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ResetLinkReceived],
    }).compileComponents();

    fixture = TestBed.createComponent(ResetLinkReceived);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideTranslateTesting,useEnglish} from '../../../../shared/utils/testing/translate.testing';
import { TrustedCompanies } from './trusted-companies';

describe('TrustedCompanies', () => {
  let fixture: ComponentFixture<TrustedCompanies>;
  let element: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TrustedCompanies],
      providers: [provideTranslateTesting()],
    }).compileComponents();
    useEnglish();

    fixture = TestBed.createComponent(TrustedCompanies);
    element = fixture.nativeElement;
    fixture.detectChanges();
  });

  it('renders a logo for every company', () => {
    const logos = element.querySelectorAll('img');

    expect(logos).toHaveLength(6);
    expect(logos[0].getAttribute('alt')).toBe('Coconut');
  });
});

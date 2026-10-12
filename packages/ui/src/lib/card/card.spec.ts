import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Card } from './card';

describe('Card', () => {
  let fixture: ComponentFixture<Card>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Card],
    }).compileComponents();
    fixture = TestBed.createComponent(Card);
  });

  it('does not render media without an image', () => {
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.card__media')).toBeNull();
  });

  it('renders the image with alt text', () => {
    fixture.componentRef.setInput('image', 'a.jpg');
    fixture.componentRef.setInput('imageAlt', 'Roses');
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img');
    expect(img.getAttribute('src')).toBe('a.jpg');
    expect(img.getAttribute('alt')).toBe('Roses');
  });

  it('applies the bordered modifier', () => {
    fixture.componentRef.setInput('bordered', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.card--bordered')).toBeTruthy();
  });
});

import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { SectionTitle } from './section-title';

@Component({
  imports: [SectionTitle],
  template: `<app-section-title [level]="level">Most Popular</app-section-title>`,
})
class HostComponent {
  level: 1 | 2 | 3 = 2;
}

describe('SectionTitle', () => {
  let fixture: ComponentFixture<HostComponent>;
  let heading: HTMLElement;

  beforeEach(async () => {
    await TestBed.configureTestingModule({ imports: [HostComponent] }).compileComponents();

    fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    heading = fixture.nativeElement.querySelector('.section-title');
  });

  it('projects the title text', () => {
    expect(heading.textContent?.trim()).toBe('Most Popular');
  });

  it('is exposed as a heading with level 2 by default', () => {
    expect(heading.getAttribute('role')).toBe('heading');
    expect(heading.getAttribute('aria-level')).toBe('2');
  });

  it('uses the given heading level', () => {
    fixture.componentInstance.level = 3;
    fixture.detectChanges();

    expect(heading.getAttribute('aria-level')).toBe('3');
  });
});

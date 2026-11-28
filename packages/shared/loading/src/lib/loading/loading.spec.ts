import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import {
  provideTranslateTesting,
  useEnglish,
} from '../../../shared/utils/testing/translate.testing';
import { LoadingService } from '../../services/loading.service';
import { Loading } from './loading';

describe('Global Loading Component', () => {
  let fixture: ComponentFixture<Loading>;
  let component: Loading;
  let loadingService: LoadingService;

  beforeEach(async () => {
    TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [Loading],
      providers: [LoadingService, provideTranslateTesting()],
    }).compileComponents();

    useEnglish();

    loadingService = TestBed.inject(LoadingService);
    loadingService.reset();

    fixture = TestBed.createComponent(Loading);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    loadingService.reset();
    TestBed.resetTestingModule();
  });

  it('is hidden when loading state is inactive', () => {
    expect(loadingService.isLoading()).toBe(false);
    expect(component.isLoading()).toBe(false);

    const overlay = fixture.debugElement.query(By.css('[role="status"]'));
    expect(overlay).toBeNull();
  });

  it('becomes visible when loading state becomes active', () => {
    loadingService.start();
    fixture.detectChanges();

    expect(component.isLoading()).toBe(true);

    const overlay = fixture.debugElement.query(By.css('[role="status"]'));
    expect(overlay).not.toBeNull();
  });

  it('responds dynamically to state changes', () => {
    // 1. Initially inactive
    expect(fixture.debugElement.query(By.css('[role="status"]'))).toBeNull();

    // 2. Request starts -> shows
    loadingService.start();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="status"]'))).not.toBeNull();

    // 3. Second request starts -> remains visible
    loadingService.start();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="status"]'))).not.toBeNull();

    // 4. One request finishes -> still visible
    loadingService.stop();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="status"]'))).not.toBeNull();

    // 5. Final request finishes -> disappears
    loadingService.stop();
    fixture.detectChanges();
    expect(fixture.debugElement.query(By.css('[role="status"]'))).toBeNull();
  });

  it('provides accessible status attributes for assistive technology', () => {
    loadingService.start();
    fixture.detectChanges();

    const overlayElement = fixture.debugElement.query(By.css('[role="status"]')).nativeElement as HTMLElement;

    expect(overlayElement.getAttribute('role')).toBe('status');
    expect(overlayElement.getAttribute('aria-live')).toBe('polite');
    expect(overlayElement.getAttribute('aria-busy')).toBe('true');
  });
});

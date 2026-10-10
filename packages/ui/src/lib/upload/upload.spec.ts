import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Upload } from './upload';

describe('Upload', () => {
  let fixture: ComponentFixture<Upload>;
  const root = () => fixture.nativeElement as HTMLElement;
  const nativeInput = () =>
    root().querySelector('input[type="file"]') as HTMLInputElement;

  function pickFile(file: File | null) {
    Object.defineProperty(nativeInput(), 'files', {
      value: file ? [file] : [],
      configurable: true,
    });
    nativeInput().dispatchEvent(new Event('change'));
    fixture.detectChanges();
  }

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [Upload],
    }).compileComponents();
    fixture = TestBed.createComponent(Upload);
    fixture.detectChanges();
  });

  it('renders the default button label', () => {
    expect(root().querySelector('.upload__btn')?.textContent).toContain(
      'Upload file',
    );
  });

  it('shows the file name and notifies the form after picking', () => {
    const onChange = jest.fn();
    const onTouched = jest.fn();
    fixture.componentInstance.registerOnChange(onChange);
    fixture.componentInstance.registerOnTouched(onTouched);
    const file = new File(['x'], 'photo.png', { type: 'image/png' });
    pickFile(file);
    expect(onChange).toHaveBeenCalledWith(file);
    expect(onTouched).toHaveBeenCalled();
    expect(root().querySelector('.upload__name')?.textContent).toContain(
      'photo.png',
    );
  });

  it('shows the current label and emits reviewClick', () => {
    const spy = jest.fn();
    fixture.componentInstance.reviewClick.subscribe(spy);
    fixture.componentRef.setInput('currentLabel', 'View current');
    fixture.detectChanges();
    const review = root().querySelector('.upload__review') as HTMLButtonElement;
    expect(review.textContent).toContain('View current');
    review.click();
    expect(spy).toHaveBeenCalledTimes(1);
  });

  it('opens the native picker from the button', () => {
    const clickSpy = jest.spyOn(nativeInput(), 'click');
    (root().querySelector('.upload__btn') as HTMLButtonElement).click();
    expect(clickSpy).toHaveBeenCalled();
  });

  it('does not open the picker when disabled', () => {
    const clickSpy = jest.spyOn(nativeInput(), 'click');
    fixture.componentInstance.setDisabledState(true);
    fixture.componentInstance.open();
    expect(clickSpy).not.toHaveBeenCalled();
  });

  it('writeValue(null) clears the file', () => {
    fixture.componentInstance.writeValue(new File(['x'], 'a.txt'));
    expect(fixture.componentInstance.file()).not.toBeNull();
    fixture.componentInstance.writeValue(null);
    expect(fixture.componentInstance.file()).toBeNull();
  });

  it('shows the error', () => {
    fixture.componentRef.setInput('error', 'File required');
    fixture.detectChanges();
    expect(root().querySelector('.field__error')?.textContent).toContain(
      'File required',
    );
  });
});

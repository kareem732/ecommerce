import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button, Input, Textarea } from '@org/ui';
import { LucideAngularModule } from 'lucide-angular';
import { PageHeader } from '../../../../shared/ui/page-header/page-header';
import { FormErrorService } from '../../../auth/utils/form-error.service';
import { CONTACT_CHANNELS, CONTACT_EMAIL } from '../../constants/contact.constants';

type ContactField = 'name' | 'email' | 'subject' | 'message';

@Component({
  selector: 'app-contact',
  imports: [ReactiveFormsModule, TranslatePipe, LucideAngularModule, Button, Input, Textarea, PageHeader],
  providers: [FormErrorService],
  templateUrl: './contact.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Contact {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly errors = inject(FormErrorService).scope('AUTH.REGISTER.ERRORS');

  protected readonly channels = CONTACT_CHANNELS;

  protected readonly form = this.fb.group({
    name: this.fb.control('', Validators.required),
    email: this.fb.control('', [Validators.required, Validators.email]),
    subject: this.fb.control('', Validators.required),
    message: this.fb.control('', [Validators.required, Validators.minLength(10)]),
  });

  protected error(field: ContactField): string {
    return this.errors.of(this.form.controls[field]);
  }

  /** No contact API exists, so the message is handed to the user's mail client. */
  protected submit(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const { name, email, subject, message } = this.form.getRawValue();
    const body = `${message}\n\n— ${name} (${email})`;
    window.location.href =
      `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
    this.form.reset();
  }
}

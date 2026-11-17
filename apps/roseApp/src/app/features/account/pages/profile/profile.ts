import { ChangeDetectionStrategy, Component, effect, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { Button, Input, Label, Phone } from '@org/ui';
import { Trash2 } from 'lucide-angular';
import { ConfirmationDialogService } from '../../../../shared/business/confirmation-dialog.service';
import { optionalPhone } from '../../../auth/utils/auth-validators';
import { FormErrorService } from '../../../auth/utils/form-error.service';
import { AvatarUpload } from '../../components/avatar-upload/avatar-upload';
import { UserProfile } from '../../interfaces/account.models';
import { ProfileForm } from '../../interfaces/profile-form.interface';
import { DeleteAccountStore } from '../../stores/delete-account.store';
import { ProfileStore } from '../../stores/profile.store';

type EditableField = 'firstName' | 'lastName' | 'phone';

@Component({
  selector: 'app-profile',
  imports: [ReactiveFormsModule, TranslatePipe, Button, Input, Label, Phone, AvatarUpload],
  providers: [ProfileStore, DeleteAccountStore, FormErrorService],
  templateUrl: './profile.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Profile {
  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store = inject(ProfileStore);
  private readonly deleteStore = inject(DeleteAccountStore);
  private readonly dialog = inject(ConfirmationDialogService);
  private readonly errors = inject(FormErrorService).scope('ACCOUNT.ERRORS');

  protected readonly profile = this.store.profile;
  protected readonly saving = this.store.loading;
  protected readonly deleting = this.deleteStore.loading;
  protected readonly selectedPhoto = signal<File | null>(null);

  protected readonly form = this.fb.group<ProfileForm>({
    firstName: this.fb.control('', Validators.required),
    lastName: this.fb.control('', Validators.required),
    email: this.fb.control({ value: '', disabled: true }),
    phone: this.fb.control('', optionalPhone),
  });

  constructor() {
    this.store.loadProfile();
    effect(() => {
      const profile = this.profile();
      if (!profile) return;
      this.fillForm(profile);
      this.selectedPhoto.set(null);
    });
  }

  protected error(field: EditableField): string {
    return this.errors.of(this.form.controls[field]);
  }

  protected save(): void {
    if (this.form.invalid) return this.form.markAllAsTouched();

    const { firstName, lastName, phone } = this.form.getRawValue();
    this.store.updateProfile({
      changes: { firstName: firstName.trim(), lastName: lastName.trim(), phone },
      photo: this.selectedPhoto(),
    });
  }

  protected async deleteAccount(): Promise<void> {
    const confirmed = await this.dialog.confirm({
      icon: Trash2,
      message: 'ACCOUNT.DELETE.MESSAGE',
      description: 'ACCOUNT.DELETE.DESCRIPTION',
      confirmText: 'ACCOUNT.DELETE.CONFIRM',
      cancelText: 'ACCOUNT.DELETE.CANCEL',
    });
    if (confirmed) this.deleteStore.deleteAccount();
  }

  private fillForm({ firstName, lastName, email, phone }: UserProfile): void {
    this.form.reset({ firstName, lastName, email, phone: phone ?? '' });
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  DestroyRef,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { ErrorMessage } from '@org/ui';
import { CloudUpload, LucideAngularModule, User } from 'lucide-angular';
import { AVATAR_ACCEPTED_TYPES, AVATAR_MAX_SIZE_BYTES } from '../../constants/account.constants';

@Component({
  selector: 'app-avatar-upload',
  imports: [TranslatePipe, LucideAngularModule, ErrorMessage],
  templateUrl: './avatar-upload.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AvatarUpload {
  readonly photoUrl = input<string | null>(null);
  readonly fileSelected = output<File>();

  protected readonly CloudUpload = CloudUpload;
  protected readonly User = User;
  protected readonly accept = AVATAR_ACCEPTED_TYPES.join(',');

  protected readonly preview = signal<string | null>(null);
  protected readonly errorKey = signal<string | null>(null);
  protected readonly displayUrl = computed(() => this.preview() ?? this.photoUrl());

  constructor() {
    inject(DestroyRef).onDestroy(() => this.revokePreview());
  }

  protected onFileChange(event: Event): void {
    const inputEl = event.target as HTMLInputElement;
    const file = inputEl.files?.[0];
    inputEl.value = '';
    if (!file) return;

    const error = this.validate(file);
    this.errorKey.set(error);
    if (error) return;

    this.revokePreview();
    this.preview.set(URL.createObjectURL(file));
    this.fileSelected.emit(file);
  }

  private validate(file: File): string | null {
    if (!AVATAR_ACCEPTED_TYPES.includes(file.type)) return 'ACCOUNT.PROFILE.PHOTO_INVALID_TYPE';
    if (file.size > AVATAR_MAX_SIZE_BYTES) return 'ACCOUNT.PROFILE.PHOTO_TOO_LARGE';
    return null;
  }

  private revokePreview(): void {
    const url = this.preview();
    if (url) URL.revokeObjectURL(url);
  }
}

import { Pipe, PipeTransform, inject } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';

@Pipe({ name: 'occasionTitle', pure: false })
export class OccasionTitlePipe implements PipeTransform {
  private readonly translate = inject(TranslateService);

  transform(title: string): string {
    const key = `SHOP.OCCASIONS.${title}`;
    const result = this.translate.instant(key);
    return result === key ? title : result;
  }
}

import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Search } from 'lucide-angular';
import { Button } from '../shared/ui/button/button';
import { Input } from '../shared/ui/input/input';
import { Textarea } from '../shared/ui/textarea/textarea';
import { Checkbox } from '../shared/ui/checkbox/checkbox';
import { Alert } from '../shared/ui/alert/alert';
import { Pagination } from '../shared/ui/pagination/pagination';
import { Otp } from '../shared/ui/otp/otp';
import { Tabs, TabItem } from '../shared/ui/tabs/tabs';
import { AccountMenu } from '../shared/ui/account-menu/account-menu';
import { Badge } from '../shared/ui/badge/badge';
import { Breadcrumb } from '../shared/ui/breadcrumb/breadcrumb';
import { BreadcrumbItem } from '../shared/ui/breadcrumb/breadcrumb.types';
import { Select, SelectOption } from '../shared/ui/select/select';
import { Phone } from '../shared/ui/phone/phone';
import { Upload } from '../shared/ui/upload/upload';

@Component({
  selector: 'app-nx-welcome',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    Button,
    Input,
    Textarea,
    Checkbox,
    Pagination,
    Otp,
    Tabs,
    AccountMenu,
    Alert,
    Badge,
    Breadcrumb,
    Select,
    Phone,
    Upload,
  ],
  template: `
    <div class="wrapper">
      <div class="container">
        <div id="welcome">
          <h1>
            <span> Hello there, </span>
            Welcome roseApp 👋
          </h1>
        </div>

        <div
          style="background: var(--bg-surface); color: var(--text-primary); border: 1px solid var(--border-default); padding: 16px"
        >
          Semantic test
        </div>
        <div
          style="background: var(--color-primary); color: var(--text-on-primary); padding: 16px"
        >
          Primary test
        </div>

        <div class="w-[50%] mx-auto">
          <div class="flex flex-col gap-4 max-w-sm my-4">
            <app-input label="Label" placeholder="Placeholder" />
            <app-input label="Label" [icon]="Search" placeholder="Search..." />
            <app-input label="Label" type="password" placeholder="********" />
            <app-input
              label="Label"
              type="password"
              placeholder="********"
              error="Required field"
            />

            <app-select label="Label" [options]="options" [(ngModel)]="country" />
            <app-select
              label="Label"
              placeholder="Placeholder"
              arrow="updown"
              [options]="options"
            />
            <app-select label="Label" [options]="options" error="Required field" />
            <app-select label="Label" [options]="options" [disabled]="true" />

            <app-phone label="Label" [(ngModel)]="phoneNumber" />
            <app-phone label="Label" error="Invalid phone number" />
            <app-phone label="Label" [disabled]="true" />

            <app-upload label="Label" accept="image/*" [(ngModel)]="avatar" />
            <app-upload
              label="Label"
              currentLabel="Review current image(s)"
              (reviewClick)="reviewImage()"
            />
            <app-upload label="Label" error="File is required" />
            <app-upload label="Label" [disabled]="true" />

            <app-textarea label="Label" placeholder="Placeholder" />
            <app-textarea label="Label" placeholder="Placeholder" error="Required field" />
            <app-textarea label="Label" placeholder="Placeholder" [disabled]="true" />

            <app-button label="Save" />
            <app-button label="Cancel" variant="outline" />
            <app-button label="Disabled" [disabled]="true" />

            <app-checkbox label="Checkbox text" [(checked)]="accepted" />
            <app-checkbox
              label="Checkbox text"
              [(checked)]="acceptedError"
              error="You must accept terms and conditions"
            />

            <app-alert message="Informative message" />
            <app-alert message="Successful operation" severity="success" />
            <app-alert message="Unsuccessful operation" severity="error" />

            <app-tabs [items]="tabs" [(active)]="current" />

            <app-otp (completed)="onOtpDone($event)" />
            <app-otp error="Invalid code" />

            <app-pagination
              [totalRecords]="100"
              [rows]="10"
              [(first)]="first"
              (pageChange)="load($event)"
            />

            <div class="flex flex-wrap gap-4">
              <app-badge value="Badge" variant="primary" />
              <app-badge value="Badge" variant="primary-dark" />
              <app-badge value="Badge" variant="soft" />
              <app-badge value="Badge" variant="soft-strong" />
              <app-badge value="Badge" variant="neutral" />
              <app-badge value="Badge" variant="neutral-strong" />
            </div>

            <app-breadcrumb [items]="crumbs" (itemClick)="go($event)" />
          </div>
        </div>

        <div class="flex justify-center my-6">
          <app-account-menu></app-account-menu>
        </div>
      </div>
    </div>
  `,
  styles: [],
  encapsulation: ViewEncapsulation.None,
})
export class NxWelcome {
  readonly Search = Search;

  name = '';
  accepted = false;
  acceptedError = false;
  first = 0;

  country = '';
  phoneNumber = '';
  avatar: File | null = null;

  options: SelectOption[] = [
    { value: 'eg', label: 'Egypt' },
    { value: 'sa', label: 'Saudi Arabia' },
    { value: 'ae', label: 'UAE' },
  ];

  tabs: TabItem[] = [
    { value: 'active', label: 'Active', content: 'Active' },
    { value: 'inactive', label: 'Inactive', content: 'Inactive' },
  ];
  current = 'active';

  crumbs: BreadcrumbItem[] = [
    { label: 'Home', value: 'home' },
    { label: 'Projects', value: 'projects' },
    { label: 'Task 1', value: 'task1' },
    { label: 'Task 2', value: 'task2' },
  ];

  load(page: number): void {
    console.log('page', page);
  }

  onOtpDone(code: string): void {
    console.log('otp', code);
  }

  go(item: BreadcrumbItem): void {
    console.log('crumb', item.value);
  }

  reviewImage(): void {
    console.log('review current image');
  }
}
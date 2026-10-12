import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';


@Component({
  selector: 'app-stepper',
  imports: [],
  templateUrl: './stepper.html',
  styleUrl: './stepper.scss',
})
export class Stepper {
  private router = inject(Router);

  currentStep = computed(() => {
    const url = this.router.url;

    if (url.includes('email')) return 1;
    if (url.includes('otp')) return 2;
    if (url.includes('user-info')) return 3;
    if (url.includes('Password')) return 4;

    return 1;
  });
}

import { bootstrapApplication } from '@angular/platform-browser';
// The shell must import rxjs-interop so Module Federation shares the shell's copy
// with the remotes. Otherwise each remote loads its own copy of Angular core
// internals and DI breaks ("No provider found for ChangeDetectionScheduler").
import '@angular/core/rxjs-interop';
import { appConfig } from './app/app.config';
import { App } from './app/app';

bootstrapApplication(App, appConfig).catch((err) => console.error(err));

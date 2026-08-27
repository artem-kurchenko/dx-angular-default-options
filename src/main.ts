import { bootstrapApplication } from '@angular/platform-browser';
import { provideZoneChangeDetection } from '@angular/core';
import { provideRouter, withHashLocation } from '@angular/router';
import config from 'devextreme/core/config';
import { AppComponent } from './app/app.component';
import { routes } from './app/app.routes';
import { licenseKey } from './devextreme-license';

config({ licenseKey });

bootstrapApplication(AppComponent, {
  providers: [
    provideZoneChangeDetection(),
    provideRouter(routes, withHashLocation()),
  ],
}).catch((err) => console.error(err));

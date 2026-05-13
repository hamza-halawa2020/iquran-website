import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';
import {
    clearLazyChunkReloadState,
    installLazyChunkRecovery,
} from './app/shared/errors/lazy-chunk-recovery';

installLazyChunkRecovery();

bootstrapApplication(AppComponent, appConfig)
    .then(() => clearLazyChunkReloadState())
    .catch((err) => console.error(err));

import { ApplicationConfig, ErrorHandler, importProvidersFrom, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withFetch, withInterceptors } from '@angular/common/http';
import { tokenInterceptor } from './token.interceptor';
import {
    TranslateModule,
    TranslateLoader
} from '@ngx-translate/core';
import { HttpClient } from '@angular/common/http';
import { LazyChunkErrorHandler } from './shared/errors/lazy-chunk-error.handler';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { InlineTranslateLoader } from './shared/i18n/inline-translate.loader';

export const appConfig: ApplicationConfig = {
    providers: [
        provideZoneChangeDetection({ eventCoalescing: true, runCoalescing: true }),
        provideHttpClient(withFetch(), withInterceptors([tokenInterceptor])),
        provideRouter(routes),
        { provide: ErrorHandler, useClass: LazyChunkErrorHandler },
        importProvidersFrom(
            TranslateModule.forRoot({
                loader: {
                    provide: TranslateLoader,
                    useClass: InlineTranslateLoader,
                    deps: [HttpClient]
                }
            })
        ),
        provideAnimationsAsync(),
    ]
};

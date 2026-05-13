import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { TranslateLoader } from '@ngx-translate/core';
import { Observable, of } from 'rxjs';
import enTranslations from '../../../assets/i18n/en.json';

@Injectable({
    providedIn: 'root',
})
export class InlineTranslateLoader implements TranslateLoader {
    constructor(private http: HttpClient) { }

    getTranslation(lang: string): Observable<Record<string, unknown>> {
        if (lang === 'en') {
            return of(enTranslations as Record<string, unknown>);
        }

        return this.http.get<Record<string, unknown>>(`./assets/i18n/${lang}.json`);
    }
}

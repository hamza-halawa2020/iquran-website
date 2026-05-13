import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable, throwError } from 'rxjs';
import { catchError, shareReplay } from 'rxjs/operators';

@Injectable({
    providedIn: 'root',
})
export class MainSliderService {
    private apiUrl = environment.backEndUrl;
    private data = '/main-sliders';
    private sliderRequest$?: Observable<any>;

    constructor(private http: HttpClient) { }

    index(forceRefresh: boolean = false): Observable<any> {
        if (!this.sliderRequest$ || forceRefresh) {
            this.sliderRequest$ = this.http.get(`${this.apiUrl}${this.data}`).pipe(
                catchError((error) => {
                    this.sliderRequest$ = undefined;
                    return throwError(() => error);
                }),
                shareReplay(1)
            );
        }

        return this.sliderRequest$;
    }
}

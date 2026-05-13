import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root',
})
export class FaqsService {
    private apiUrl = environment.backEndUrl;

    constructor(private http: HttpClient) {}

    getFaqsList(page: number = 1): Observable<any> {
        return this.http.get(`${this.apiUrl}/faqs?page=${page}`);
    }
}

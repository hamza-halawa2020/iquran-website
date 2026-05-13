import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CertificatesService {
    private apiUrl = environment.backEndUrl;

    constructor(private http: HttpClient) { }

    getCertificatesList(page: number = 1): Observable<any> {
        return this.http.get(`${this.apiUrl}/certificates?page=${page}`);
    }

    getCertificateDetails(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/certificates/${id}`);
    }
}

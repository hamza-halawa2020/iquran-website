import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class TeachersService {
    private apiUrl = environment.backEndUrl;

    constructor(private http: HttpClient) { }

    getTeachers(page: number = 1, limit: number = 12): Observable<any> {
        return this.http.get(`${this.apiUrl}/staff?page=${page}&limit=${limit}`);
    }
}

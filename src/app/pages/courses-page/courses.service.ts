import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class CoursesService {
    private apiUrl = environment.backEndUrl;

    constructor(private http: HttpClient) { }

    getCoursesList(page: number = 1): Observable<any> {
        return this.http.get(`${this.apiUrl}/courses?page=${page}`);
    }

    getCourseDetails(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/courses/${id}`);
    }
}

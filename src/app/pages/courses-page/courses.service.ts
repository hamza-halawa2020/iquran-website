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

    getCoursesList(page: number = 1, categoryId?: number | null, limit?: number): Observable<any> {
        const params = new URLSearchParams();
        params.set('page', String(page));
        if (limit) {
            params.set('limit', String(limit));
        }
        if (categoryId) {
            params.set('course_category_id', String(categoryId));
        }
        return this.http.get(`${this.apiUrl}/courses?${params.toString()}`);
    }

    getCourseDetails(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/courses/${id}`);
    }

    getCourseCategories(): Observable<any> {
        return this.http.get(`${this.apiUrl}/course-categories`);
    }
}

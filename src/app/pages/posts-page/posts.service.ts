import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

@Injectable({
    providedIn: 'root'
})
export class PostsService {
    private apiUrl = environment.backEndUrl;

    constructor(private http: HttpClient) { }

    getPostsList(page: number = 1): Observable<any> {
        return this.http.get(`${this.apiUrl}/posts?page=${page}`);
    }

    getPostDetails(id: string): Observable<any> {
        return this.http.get(`${this.apiUrl}/posts/${id}`);
    }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface MediaItem {
  id: number;
  title: string;
  description: string;
  media_type: 'image' | 'video' | 'audio';
  media_url: string;
  thumbnail_url?: string;
  category?: string;
  created_at: string;
}

@Injectable({
  providedIn: 'root'
})
export class MediaGalleryService {
  private apiUrl = `${environment.backEndUrl}/media-center`;

  constructor(private http: HttpClient) { }

  getAllMedia(page: number = 1, type: string = 'all'): Observable<any> {
    let url = `${this.apiUrl}?page=${page}`;
    if (type !== 'all') {
      url += `&type=${type}`;
    }
    return this.http.get<any>(url).pipe(
      catchError(() => {
        return of({ data: [], meta: null });
      })
    );
  }

  getMediaByType(type: string, page: number = 1): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}?type=${type}&page=${page}`).pipe(
      catchError(() => {
        return of({ data: [], meta: null });
      })
    );
  }
}

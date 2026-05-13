import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface HomeStats {
  completedStudies: number;
  satisfiedClients: number;
  yearsExperience: number;
  successPartners: number;
}

export interface HomeData {
  stats: HomeStats;
  latestWorkSamples: any[];
  teamMembers: any[];
  testimonials: any[];
  latestPosts: any[];
  latestCourses: any[];
  certificates: any[];
  partners: any[];
  mediaItems: any[];
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private apiUrl = environment.backEndUrl;

  constructor(
    private http: HttpClient,
  ) { }

  getHomeData(): Observable<HomeData> {
    const features = environment.features || {
      workSamples: false,
      staff: false,
      successPartners: false,
    };

    return forkJoin({
      workSamples: features.workSamples ? this.getLatestWorkSamples() : of([]),
      teamMembers: features.staff ? this.getTeamMembers() : of([]),
      testimonials: this.getTestimonials(),
      posts: this.getLatestPosts(),
      courses: this.getLatestCourses(),
      certificates: this.getCertificates(),
      partners: features.successPartners ? this.getPartners() : of([]),
      stats: this.getStats(),
      mediaItems: this.getMediaItems()
    }).pipe(
      map(data => ({
        stats: data.stats,
        latestWorkSamples: data.workSamples,
        teamMembers: data.teamMembers,
        testimonials: data.testimonials,
        latestPosts: data.posts,
        latestCourses: data.courses,
        certificates: data.certificates,
        partners: data.partners,
        mediaItems: data.mediaItems
      })),

    );
  }

  getLatestWorkSamples(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/work-samples?limit=3`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          return of([]);
        })
      );
  }

  getTeamMembers(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/staff?limit=4`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          return of([]);
        })
      );
  }

  getTestimonials(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/reviews?page=1`)
      .pipe(
        map((response) => this.mapTestimonials(response.data || [])),
        catchError(() => {
          return of([]);
        })
      );
  }

  getLatestPosts(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/posts?page=1`)
      .pipe(
        map((response) => response.data || []),
        catchError(() => of([]))
      );
  }

  getLatestCourses(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/courses?page=1`)
      .pipe(
        map((response) => response.data || []),
        catchError(() => of([]))
      );
  }

  getPartners(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/success-partners`)
      .pipe(
        map(response => {
          const partners = response.data || [];
          return partners.map((partner: any) => ({
            id: partner.id,
            name: partner.name,
            logo_url: partner.image_url,
            link: partner.link,
            status: partner.status
          }));
        }),
        catchError(error => {
          return of([]);
        })
      );
  }

  getStats(): Observable<HomeStats> {
    return of({
      completedStudies: 250,
      satisfiedClients: 800,
      yearsExperience: 20,
      successPartners: 75
    });
  }

  getMediaItems(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/media-center?page=1`)
      .pipe(
        map((response) => response.data || []),
        catchError(() => {
          return of([]);
        })
      );
  }

  private mapTestimonials(reviews: any[]): any[] {
    return reviews.map((review: any) => ({
      id: review.id,
      client_name: review.name,
      country: review.country,
      comment: review.review,
      status: review.status,
      created_at: review.created_at
    }));
  }

  getCertificates(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/certificates?page=1`)
      .pipe(
        map((response) => response.data || []),
        catchError(() => of([]))
      );
  }

  getFeaturedServices(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/services?limit=3`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          return of([]);
        })
      );
  }

  getFeaturedFeasibilityStudies(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/feasibility-studies?limit=3`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          return of([]);
        })
      );
  }

  getFeaturedInvestmentOpportunities(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/investment-opportunities?limit=3`)
      .pipe(
        map(response => response.data || []),
        catchError(error => {
          return of([]);
        })
      );
  }
}


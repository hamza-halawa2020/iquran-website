import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, forkJoin, of } from 'rxjs';
import { map, catchError, switchMap } from 'rxjs/operators';
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
        switchMap((response) => {
          const firstPageTestimonials = this.mapTestimonials(response.data || []);
          const lastPage = response.meta?.last_page || 1;

          if (lastPage <= 1) {
            return of(firstPageTestimonials);
          }

          const remainingPageRequests: Observable<any>[] = [];
          for (let page = 2; page <= lastPage; page++) {
            remainingPageRequests.push(this.http.get<any>(`${this.apiUrl}/reviews?page=${page}`));
          }

          return forkJoin(remainingPageRequests).pipe(
            map((remainingPages) => [
              ...firstPageTestimonials,
              ...remainingPages.flatMap((pageResponse) => this.mapTestimonials(pageResponse.data || []))
            ])
          );
        }),
        catchError(() => {
          return of([]);
        })
      );
  }

  getLatestPosts(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/posts?page=1`)
      .pipe(
        switchMap((response) => {
          const firstPagePosts = response.data || [];
          const lastPage = response.meta?.last_page || 1;

          if (lastPage <= 1) {
            return of(firstPagePosts);
          }

          const remainingPageRequests: Observable<any>[] = [];
          for (let page = 2; page <= lastPage; page++) {
            remainingPageRequests.push(this.http.get<any>(`${this.apiUrl}/posts?page=${page}`));
          }

          return forkJoin(remainingPageRequests).pipe(
            map((remainingPages) => [
              ...firstPagePosts,
              ...remainingPages.flatMap((pageResponse) => pageResponse.data || [])
            ])
          );
        }),
        catchError(() => of([]))
      );
  }

  getLatestCourses(): Observable<any[]> {
    return this.http.get<any>(`${this.apiUrl}/courses?page=1`)
      .pipe(
        switchMap((response) => {
          const firstPageCourses = response.data || [];
          const lastPage = response.meta?.last_page || 1;

          if (lastPage <= 1) {
            return of(firstPageCourses);
          }

          // Keep the home page in sync with the full courses listing by merging all pages.
          const remainingPageRequests: Observable<any>[] = [];
          for (let page = 2; page <= lastPage; page++) {
            remainingPageRequests.push(this.http.get<any>(`${this.apiUrl}/courses?page=${page}`));
          }

          return forkJoin(remainingPageRequests).pipe(
            map((remainingPages) => [
              ...firstPageCourses,
              ...remainingPages.flatMap((pageResponse) => pageResponse.data || [])
            ])
          );
        }),
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
        switchMap((response) => {
          const firstPageMediaItems = response.data || [];
          const lastPage = response.meta?.last_page || 1;

          if (lastPage <= 1) {
            return of(firstPageMediaItems);
          }

          const remainingPageRequests: Observable<any>[] = [];
          for (let page = 2; page <= lastPage; page++) {
            remainingPageRequests.push(this.http.get<any>(`${this.apiUrl}/media-center?page=${page}`));
          }

          return forkJoin(remainingPageRequests).pipe(
            map((remainingPages) => [
              ...firstPageMediaItems,
              ...remainingPages.flatMap((pageResponse) => pageResponse.data || [])
            ])
          );
        }),
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
        switchMap((response) => {
          const firstPageCertificates = response.data || [];
          const lastPage = response.meta?.last_page || 1;

          if (lastPage <= 1) {
            return of(firstPageCertificates);
          }

          const remainingPageRequests: Observable<any>[] = [];
          for (let page = 2; page <= lastPage; page++) {
            remainingPageRequests.push(this.http.get<any>(`${this.apiUrl}/certificates?page=${page}`));
          }

          return forkJoin(remainingPageRequests).pipe(
            map((remainingPages) => [
              ...firstPageCertificates,
              ...remainingPages.flatMap((pageResponse) => pageResponse.data || [])
            ])
          );
        }),
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

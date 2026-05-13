import { Routes } from '@angular/router';
import { HomeDemoOneComponent } from './demos/home-demo-one/home-demo-one.component';

export const routes: Routes = [
    { path: '', component: HomeDemoOneComponent },
    {
        path: 'about',
        loadComponent: () => import('./pages/about-page/about-page.component').then(m => m.AboutPageComponent)
    },
    {
        path: 'privacy-policy',
        loadComponent: () => import('./pages/privacy-policy-page/privacy-policy-page.component').then(m => m.PrivacyPolicyPageComponent)
    },
    {
        path: 'terms-conditions',
        loadComponent: () => import('./pages/terms-conditions-page/terms-conditions-page.component').then(m => m.TermsConditionsPageComponent)
    },
    {
        path: 'contacts',
        loadComponent: () => import('./pages/contact-page/contact-page.component').then(m => m.ContactPageComponent)
    },

    {
        path: 'posts',
        loadComponent: () => import('./pages/posts-page/posts-list/posts-list.component').then(m => m.PostsListComponent)
    },
    {
        path: 'posts/:id',
        loadComponent: () => import('./pages/posts-page/post-details/post-details.component').then(m => m.PostDetailsComponent)
    },

    {
        path: 'courses',
        loadComponent: () => import('./pages/courses-page/courses-list/courses-list.component').then(m => m.CoursesListComponent)
    },
    {
        path: 'courses/:id',
        loadComponent: () => import('./pages/courses-page/course-details/course-details.component').then(m => m.CourseDetailsComponent)
    },

    {
        path: 'testimonials',
        loadComponent: () => import('./pages/reviews-page/reviews-list/reviews-list.component').then(m => m.ReviewsListComponent)
    },

    {
        path: 'add-testimonials',
        loadComponent: () => import('./pages/add-review-page/add-review-page.component').then(m => m.AddReviewPageComponent)
    },

    {
        path: 'media',
        loadComponent: () => import('./pages/media-gallery-page/media-gallery-page.component').then(m => m.MediaGalleryPageComponent)
    },

    {
        path: 'certificates',
        loadComponent: () => import('./pages/certificates-page/certificates-list/certificates-list.component').then(m => m.CertificatesListComponent)
    },

    {
        path: '**',
        loadComponent: () => import('./pages/error-page/error-page.component').then(m => m.ErrorPageComponent)
    },
];


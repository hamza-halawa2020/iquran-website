import { AfterViewInit, Component, ElementRef, NgZone, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { MainSlider } from '../../common/main-slider/main-slider.component';
import { HowItWorksComponent } from '../../common/how-it-works/how-it-works.component';
import { AboutSectionComponent } from './components/about-section/about-section.component';
import { ServicesSectionComponent } from './components/services-section/services-section.component';
import { StatsSectionComponent } from './components/stats-section/stats-section.component';
import { TestimonialsSectionComponent } from './components/testimonials-section/testimonials-section.component';
import { LatestPostsSectionComponent } from './components/latest-posts-section/latest-posts-section.component';
import { CertificatesSectionComponent } from './components/certificates-section/certificates-section.component';
import { MediaGallerySectionComponent } from './components/media-gallery-section/media-gallery-section.component';
import { PaymentMethodsComponent } from '../../common/payment-methods/payment-methods.component';
import { ContactComponent } from '../../common/contact/contact.component';
import { HomeService, HomeData } from './home.service';
import { ScrollRevealDirective } from '../../shared/directives/scroll-reveal.directive';

type IdleWindow = Window & {
    requestIdleCallback?: (callback: (_deadline: unknown) => void, options?: { timeout: number }) => number;
    cancelIdleCallback?: (handle: number) => void;
};

@Component({
    selector: 'app-home-demo-one',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        TranslateModule,
        MainSlider,
        HowItWorksComponent,
        AboutSectionComponent,
        ServicesSectionComponent,
        StatsSectionComponent,
        TestimonialsSectionComponent,
        LatestPostsSectionComponent,
        CertificatesSectionComponent,
        MediaGallerySectionComponent,
        PaymentMethodsComponent,
        ContactComponent,
        ScrollRevealDirective,
    ],
    templateUrl: './home-demo-one.component.html',
    styleUrl: './home-demo-one.component.scss',
})
export class HomeDemoOneComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('homeDataTrigger')
    private homeDataTrigger?: ElementRef<HTMLElement>;

    homeData: HomeData | null = null;
    isLoading = false;
    error: string | null = null;
    private homeDataSubscription?: Subscription;
    private removeLoadListener?: () => void;
    private idleCallbackId: number | null = null;
    private idleTimeoutId: number | null = null;
    private hasRequestedHomeData = false;
    private homeDataObserver?: IntersectionObserver;

    defaultStats = {
        completedStudies: 1500,  // Students graduated
        satisfiedClients: 3200,  // Active students
        yearsExperience: 15,     // Years of teaching excellence
        successPartners: 45      // Qualified teachers
    };

    constructor(
        public translate: TranslateService,
        private homeService: HomeService,
        private ngZone: NgZone
    ) { }

    ngOnInit(): void {
        if (typeof window === 'undefined') {
            this.loadHomeData();
        }
    }

    ngAfterViewInit(): void {
        if (typeof window !== 'undefined') {
            this.scheduleHomeDataLoad();
        }
    }

    ngOnDestroy(): void {
        this.homeDataObserver?.disconnect();
        this.removeLoadListener?.();
        this.homeDataSubscription?.unsubscribe();

        if (typeof window === 'undefined') {
            return;
        }

        const idleWindow = window as IdleWindow;
        if (this.idleCallbackId !== null) {
            idleWindow.cancelIdleCallback?.(this.idleCallbackId);
            this.idleCallbackId = null;
        }

        if (this.idleTimeoutId !== null) {
            window.clearTimeout(this.idleTimeoutId);
            this.idleTimeoutId = null;
        }
    }

    loadHomeData(): void {
        this.hasRequestedHomeData = true;
        this.isLoading = true;
        this.error = null;

        this.homeDataSubscription?.unsubscribe();
        this.homeDataSubscription = this.homeService.getHomeData().subscribe({
            next: (data) => {
                if (!this.homeData) {
                    this.homeData = {
                        stats: this.defaultStats,
                        latestWorkSamples: [],
                        teamMembers: [],
                        testimonials: [],
                        latestPosts: [],
                        latestCourses: [],
                        certificates: [],
                        partners: [],
                        mediaItems: []
                    };
                }

                if (data.stats) {
                    this.homeData.stats = data.stats;
                }
                if (data.testimonials && data.testimonials.length > 0) {
                    this.homeData.testimonials = data.testimonials;
                }
                if (data.partners && data.partners.length > 0) {
                    this.homeData.partners = data.partners;
                }
                if (data.latestWorkSamples && data.latestWorkSamples.length > 0) {
                    this.homeData.latestWorkSamples = data.latestWorkSamples;
                }
                if (data.teamMembers && data.teamMembers.length > 0) {
                    this.homeData.teamMembers = data.teamMembers;
                }
                if (data.latestPosts && data.latestPosts.length > 0) {
                    this.homeData.latestPosts = data.latestPosts;
                }
                if (data.latestCourses && data.latestCourses.length > 0) {
                    this.homeData.latestCourses = data.latestCourses;
                }
                if (data.certificates && data.certificates.length > 0) {
                    this.homeData.certificates = data.certificates;
                }
                if (data.mediaItems && data.mediaItems.length > 0) {
                    this.homeData.mediaItems = data.mediaItems;
                }

                this.isLoading = false;
            },
            error: (error) => {
                
                if (!this.homeData) {
                    this.homeData = {
                        stats: this.defaultStats,
                        latestWorkSamples: [],
                        teamMembers: [],
                        testimonials: [],
                        latestPosts: [],
                        latestCourses: [],
                        certificates: [],
                        partners: [],
                        mediaItems: []
                    };
                }
                this.isLoading = false;
            }
        });
    }

    retryLoadData(): void {
        this.clearScheduledHomeDataLoad();
        this.hasRequestedHomeData = false;
        this.loadHomeData();
    }

    private scheduleHomeDataLoad(): void {
        if (typeof window === 'undefined') {
            this.loadHomeData();
            return;
        }

        const triggerElement = this.homeDataTrigger?.nativeElement;
        if (!triggerElement || typeof IntersectionObserver !== 'function') {
            this.scheduleFallbackHomeDataLoad();
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            this.homeDataObserver = new IntersectionObserver((entries) => {
                if (!entries.some((entry) => entry.isIntersecting || entry.intersectionRatio > 0)) {
                    return;
                }

                this.homeDataObserver?.disconnect();
                this.homeDataObserver = undefined;

                if (this.hasRequestedHomeData) {
                    return;
                }

                this.ngZone.run(() => {
                    this.loadHomeData();
                });
            }, {
                rootMargin: '500px 0px 900px',
                threshold: 0,
            });

            this.homeDataObserver.observe(triggerElement);
        });
    }

    private scheduleFallbackHomeDataLoad(): void {
        this.ngZone.runOutsideAngular(() => {
            const startLoading = () => {
                if (this.hasRequestedHomeData) {
                    return;
                }

                this.ngZone.run(() => {
                    this.loadHomeData();
                });
            };

            const queueIdleLoad = () => {
                this.removeLoadListener?.();

                const idleWindow = window as IdleWindow;
                if (typeof idleWindow.requestIdleCallback === 'function') {
                    this.idleCallbackId = idleWindow.requestIdleCallback(() => {
                        this.idleCallbackId = null;
                        startLoading();
                    }, { timeout: 1500 });
                    return;
                }

                this.idleTimeoutId = window.setTimeout(() => {
                    this.idleTimeoutId = null;
                    startLoading();
                }, 600);
            };

            if (document.readyState === 'complete') {
                queueIdleLoad();
                return;
            }

            const onWindowLoad = () => {
                queueIdleLoad();
            };

            window.addEventListener('load', onWindowLoad, { once: true });
            this.removeLoadListener = () => {
                window.removeEventListener('load', onWindowLoad);
                this.removeLoadListener = undefined;
            };
        });
    }

    private clearScheduledHomeDataLoad(): void {
        this.removeLoadListener?.();

        if (typeof window === 'undefined') {
            return;
        }

        const idleWindow = window as IdleWindow;
        if (this.idleCallbackId !== null) {
            idleWindow.cancelIdleCallback?.(this.idleCallbackId);
            this.idleCallbackId = null;
        }

        if (this.idleTimeoutId !== null) {
            window.clearTimeout(this.idleTimeoutId);
            this.idleTimeoutId = null;
        }
    }
}

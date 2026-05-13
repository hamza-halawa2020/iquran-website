import { AfterViewInit, ChangeDetectorRef, Component, ElementRef, Input, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-testimonials-section',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './testimonials-section.component.html',
    styleUrls: ['./testimonials-section.component.scss']
})
export class TestimonialsSectionComponent implements AfterViewInit, OnDestroy {
    @Input() testimonials: any[] = [];
    @ViewChild('testimonialsTrack') private testimonialsTrack?: ElementRef<HTMLDivElement>;
    @ViewChildren('testimonialSlide') private testimonialSlides?: QueryList<ElementRef<HTMLDivElement>>;

    canScrollPrev = true;
    canScrollNext = true;
    private edgeObserver?: IntersectionObserver;
    private slidesChangesSubscription?: Subscription;

    constructor(
        public translate: TranslateService,
        private cdr: ChangeDetectorRef
    ) { }

    get hasMultipleTestimonials(): boolean {
        return this.testimonials.length > 1;
    }

    get isRtl(): boolean {
        return typeof document !== 'undefined' && document.dir === 'rtl';
    }

    scrollTestimonials(direction: 'prev' | 'next'): void {
        const track = this.testimonialsTrack?.nativeElement;
        if (!track) {
            return;
        }

        const scrollAmount = Math.max(track.clientWidth * 0.9, 320);
        const delta = direction === 'next' ? scrollAmount : -scrollAmount;
        const normalizedDelta = this.isRtl ? -delta : delta;

        track.scrollBy({
            left: normalizedDelta,
            behavior: 'smooth'
        });
    }

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.updateScrollButtons();
            this.cdr.detectChanges();
        });
        this.slidesChangesSubscription = this.testimonialSlides?.changes.subscribe(() => {
            setTimeout(() => {
                this.updateScrollButtons();
                this.cdr.detectChanges();
            });
        });
    }

    ngOnDestroy(): void {
        this.edgeObserver?.disconnect();
        this.slidesChangesSubscription?.unsubscribe();
    }

    getInitials(name: string): string {
        return (name || '')
            .split(' ')
            .filter(Boolean)
            .slice(0, 2)
            .map((part) => part[0])
            .join('')
            .toUpperCase();
    }

    formatDate(dateString: string): string {
        if (!dateString) {
            return '';
        }

        const locale = this.translate.currentLang === 'ar' ? 'ar-EG' : 'en-US';
        const date = new Date(dateString);

        return date.toLocaleDateString(locale, {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    private updateScrollButtons(): void {
        const track = this.testimonialsTrack?.nativeElement;
        const slides = this.testimonialSlides?.toArray() ?? [];

        this.edgeObserver?.disconnect();

        if (!track || slides.length <= 1 || typeof IntersectionObserver === 'undefined') {
            this.canScrollPrev = false;
            this.canScrollNext = false;
            return;
        }

        const firstSlide = slides[0].nativeElement;
        const lastSlide = slides[slides.length - 1].nativeElement;

        this.canScrollPrev = true;
        this.canScrollNext = true;

        this.edgeObserver = new IntersectionObserver((entries) => {
            for (const entry of entries) {
                const isFullyVisible = entry.isIntersecting && entry.intersectionRatio >= 0.98;

                if (entry.target === firstSlide) {
                    this.canScrollPrev = !isFullyVisible;
                }

                if (entry.target === lastSlide) {
                    this.canScrollNext = !isFullyVisible;
                }
            }
        }, {
            root: track,
            threshold: [0.98, 1],
        });

        this.edgeObserver.observe(firstSlide);
        this.edgeObserver.observe(lastSlide);
    }
}

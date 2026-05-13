import { AfterViewInit, Component, ElementRef, Input, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ContentCardComponent } from '../../../../shared/components/content-card/content-card.component';

@Component({
    selector: 'app-latest-courses-section',
    standalone: true,
    imports: [CommonModule, TranslateModule, ContentCardComponent],
    templateUrl: './latest-courses-section.component.html',
    styleUrls: ['./latest-courses-section.component.scss']
})
export class LatestCoursesSectionComponent implements AfterViewInit, OnDestroy {
    @Input() courses: any[] = [];
    @ViewChild('coursesTrack') private coursesTrack?: ElementRef<HTMLDivElement>;
    @ViewChildren('courseSlide') private courseSlides?: QueryList<ElementRef<HTMLDivElement>>;
    canScrollPrev = true;
    canScrollNext = true;
    private edgeObserver?: IntersectionObserver;
    private slidesChangesSubscription?: Subscription;

    get hasMultipleCourses(): boolean {
        return this.courses.length > 1;
    }

    get isRtl(): boolean {
        return typeof document !== 'undefined' && document.dir === 'rtl';
    }

    scrollCourses(direction: 'prev' | 'next'): void {
        const track = this.coursesTrack?.nativeElement;
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
        setTimeout(() => this.updateScrollButtons());
        this.slidesChangesSubscription = this.courseSlides?.changes.subscribe(() => {
            setTimeout(() => this.updateScrollButtons());
        });
    }

    ngOnDestroy(): void {
        this.edgeObserver?.disconnect();
        this.slidesChangesSubscription?.unsubscribe();
    }

    private updateScrollButtons(): void {
        const track = this.coursesTrack?.nativeElement;
        const slides = this.courseSlides?.toArray() ?? [];

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

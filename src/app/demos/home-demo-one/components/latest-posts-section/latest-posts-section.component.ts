import { AfterViewInit, Component, ElementRef, Input, OnDestroy, QueryList, ViewChild, ViewChildren } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { ContentCardComponent } from '../../../../shared/components/content-card/content-card.component';

@Component({
    selector: 'app-latest-posts-section',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule, ContentCardComponent],
    templateUrl: './latest-posts-section.component.html',
    styleUrls: ['./latest-posts-section.component.scss']
})
export class LatestPostsSectionComponent implements AfterViewInit, OnDestroy {
    @Input() posts: any[] = [];
    @ViewChild('postsTrack') private postsTrack?: ElementRef<HTMLDivElement>;
    @ViewChildren('postSlide') private postSlides?: QueryList<ElementRef<HTMLDivElement>>;

    canScrollPrev = false;
    canScrollNext = false;
    private edgeObserver?: IntersectionObserver;
    private slidesChangesSubscription?: Subscription;

    get hasMultiplePosts(): boolean {
        return this.posts.length > 1;
    }

    get isRtl(): boolean {
        return typeof document !== 'undefined' && document.dir === 'rtl';
    }

    scrollPosts(direction: 'prev' | 'next'): void {
        const track = this.postsTrack?.nativeElement;
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
        this.updateScrollButtons();
        this.slidesChangesSubscription = this.postSlides?.changes.subscribe(() => {
            this.updateScrollButtons();
        });
    }

    ngOnDestroy(): void {
        this.edgeObserver?.disconnect();
        this.slidesChangesSubscription?.unsubscribe();
    }

    private updateScrollButtons(): void {
        const track = this.postsTrack?.nativeElement;
        const slides = this.postSlides?.toArray() ?? [];

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

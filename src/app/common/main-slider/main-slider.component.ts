import { CommonModule, NgClass, NgIf, NgOptimizedImage } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { MainSliderService } from './main-slider.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

interface SliderItem {
    id?: string | number;
    title?: string;
    description?: string;
    image_url: string;
    link?: string;
    isFallback?: boolean;
}

@Component({
    selector: 'app-main-slider',
    standalone: true,
    imports: [
        CommonModule,
        NgIf,
        NgClass,
        NgOptimizedImage,
        TranslateModule
    ],
    templateUrl: './main-slider.component.html',
    styleUrls: ['./main-slider.component.scss'],
})
export class MainSlider implements OnInit, OnDestroy {
    readonly fallbackSlide: SliderItem = {
        id: 'home-fallback-slide',
        image_url: '/assets/images/logo.svg',
        link: '/courses',
        isFallback: true,
    };
    sliderData: SliderItem[] = [this.fallbackSlide];
    currentSlideIndex = 0;
    private autoplayTimeoutId: number | null = null;
    private remoteFetchTimeoutId: number | null = null;
    private remoteFetchBackupTimeoutId: number | null = null;
    private idleCallbackId: number | null = null;
    private removeRemoteFetchListeners?: () => void;
    private hasRequestedRemoteSlides = false;
    private isAutoplayPaused = false;
    private readonly autoplayDelay = 5000;
    private readonly prefersReducedMotion =
        typeof window !== 'undefined'
            && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    constructor(
        private mainSliderService: MainSliderService,
        public translate: TranslateService,
        private ngZone: NgZone
    ) { }

    ngOnInit(): void {
        this.startAutoplay();
        this.queueRemoteSlidesFetch();
    }

    ngOnDestroy(): void {
        this.clearAutoplay();
        this.clearPendingFetch();
    }

    fetchSliderData(): void {
        this.mainSliderService.index().subscribe({
            next: (response: any) => {
                this.sliderData = this.mergeSlides(response?.data);
                this.currentSlideIndex = 0;
                this.startAutoplay();
            },
            error: () => {
                this.sliderData = [this.fallbackSlide];
                this.clearAutoplay();
            }
        });
    }

    prevSlide(): void {
        this.moveToSlide(this.currentSlideIndex - 1);
    }

    nextSlide(): void {
        this.moveToSlide(this.currentSlideIndex + 1);
    }

    goToSlide(index: number): void {
        this.moveToSlide(index);
    }

    pauseAutoplay(): void {
        this.isAutoplayPaused = true;
        this.clearAutoplay();
    }

    resumeAutoplay(): void {
        this.isAutoplayPaused = false;
        this.startAutoplay();
    }

    trackBySlide(index: number, slide: any): string | number {
        return slide?.id || slide?.image_url || slide?.link || index;
    }

    isSlideActive(index: number): boolean {
        return index === this.currentSlideIndex;
    }

    private moveToSlide(index: number): void {
        if (!this.sliderData.length) {
            return;
        }

        const slideCount = this.sliderData.length;
        this.currentSlideIndex = (index + slideCount) % slideCount;
        this.startAutoplay();
    }

    private queueRemoteSlidesFetch(): void {
        if (this.hasRequestedRemoteSlides) {
            return;
        }

        if (typeof window === 'undefined') {
            this.hasRequestedRemoteSlides = true;
            this.fetchSliderData();
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            const beginFetch = () => {
                this.clearPendingFetch();

                if (this.hasRequestedRemoteSlides) {
                    return;
                }

                const fetchSlides = () => {
                    this.hasRequestedRemoteSlides = true;
                    this.ngZone.run(() => {
                        this.fetchSliderData();
                    });
                };

                if (typeof requestIdleCallback === 'function') {
                    this.idleCallbackId = requestIdleCallback(() => {
                        this.idleCallbackId = null;
                        fetchSlides();
                    }, { timeout: 1800 });
                    return;
                }

                this.remoteFetchTimeoutId = window.setTimeout(() => {
                    this.remoteFetchTimeoutId = null;
                    fetchSlides();
                }, 400);
            };

            const pointerHandler = () => beginFetch();
            const scrollHandler = () => beginFetch();
            const keydownHandler = () => beginFetch();

            window.addEventListener('pointerdown', pointerHandler, { passive: true, once: true });
            window.addEventListener('touchstart', pointerHandler, { passive: true, once: true });
            window.addEventListener('scroll', scrollHandler, { passive: true, once: true });
            window.addEventListener('keydown', keydownHandler, { once: true });

            this.removeRemoteFetchListeners = () => {
                window.removeEventListener('pointerdown', pointerHandler);
                window.removeEventListener('touchstart', pointerHandler);
                window.removeEventListener('scroll', scrollHandler);
                window.removeEventListener('keydown', keydownHandler);
                this.removeRemoteFetchListeners = undefined;
            };

            this.remoteFetchBackupTimeoutId = window.setTimeout(() => {
                this.remoteFetchBackupTimeoutId = null;
                beginFetch();
            }, 12000);
        });
    }

    private mergeSlides(remoteSlides: unknown): SliderItem[] {
        const validRemoteSlides = Array.isArray(remoteSlides)
            ? remoteSlides.filter((slide): slide is SliderItem => !!slide?.image_url)
            : [];

        return [
            this.fallbackSlide,
            ...validRemoteSlides.filter((slide) => slide.image_url !== this.fallbackSlide.image_url),
        ];
    }

    private startAutoplay(): void {
        this.clearAutoplay();

        if (this.prefersReducedMotion || this.isAutoplayPaused || this.sliderData.length < 2) {
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            this.autoplayTimeoutId = window.setTimeout(() => {
                this.autoplayTimeoutId = null;
                this.ngZone.run(() => {
                    this.nextSlide();
                });
            }, this.autoplayDelay);
        });
    }

    private clearAutoplay(): void {
        if (this.autoplayTimeoutId !== null) {
            window.clearTimeout(this.autoplayTimeoutId);
            this.autoplayTimeoutId = null;
        }
    }

    private clearPendingFetch(): void {
        this.removeRemoteFetchListeners?.();

        if (this.remoteFetchTimeoutId !== null) {
            window.clearTimeout(this.remoteFetchTimeoutId);
            this.remoteFetchTimeoutId = null;
        }

        if (this.remoteFetchBackupTimeoutId !== null) {
            window.clearTimeout(this.remoteFetchBackupTimeoutId);
            this.remoteFetchBackupTimeoutId = null;
        }

        if (typeof cancelIdleCallback === 'function' && this.idleCallbackId !== null) {
            cancelIdleCallback(this.idleCallbackId);
            this.idleCallbackId = null;
        }
    }
}

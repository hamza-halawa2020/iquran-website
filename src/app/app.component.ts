import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { ViewportScroller } from '@angular/common';
import { RouterOutlet, Router, Event, NavigationEnd } from '@angular/router';
import { NavbarComponent } from './common/navbar/navbar.component';
import { WhatsappFloatComponent } from './common/whatsapp-float/whatsapp-float.component';
import { FooterComponent } from './common/footer/footer.component';
import { BackToTopComponent } from './common/back-to-top/back-to-top.component';

@Component({
    selector: 'app-root',
    standalone: true,
    imports: [RouterOutlet, NavbarComponent, WhatsappFloatComponent,  FooterComponent, BackToTopComponent],
    templateUrl: './app.component.html',
    styleUrl: './app.component.scss',
})
export class AppComponent implements OnInit, OnDestroy {
    title = 'iquran';
    showCustomCursor = false;
    showFloatingUi = false;
    private removeCursorBootstrapListener?: () => void;
    private removeFloatingUiBootstrapListeners?: () => void;
    private floatingUiTimeoutId: number | null = null;

    constructor(
        private router: Router,
        private viewportScroller: ViewportScroller,
        private ngZone: NgZone
    ) {
        this.router.events.subscribe((event: Event) => {
            if (event instanceof NavigationEnd) {
                this.viewportScroller.scrollToPosition([0, 0]);
            }
        });
    }

    ngOnInit(): void {
        if (typeof window === 'undefined') {
            return;
        }

        this.bootstrapFloatingUi();

        const supportsFinePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

        if (!supportsFinePointer || prefersReducedMotion) {
            return;
        }

        this.ngZone.runOutsideAngular(() => {
            const enableCustomCursor = () => {
                this.removeCursorBootstrapListener?.();
                this.ngZone.run(() => {
                    this.showCustomCursor = true;
                });
            };

            window.addEventListener('mousemove', enableCustomCursor, { passive: true, once: true });
            this.removeCursorBootstrapListener = () => {
                window.removeEventListener('mousemove', enableCustomCursor);
                this.removeCursorBootstrapListener = undefined;
            };
        });
    }

    ngOnDestroy(): void {
        this.removeCursorBootstrapListener?.();
        this.removeFloatingUiBootstrapListeners?.();

        if (this.floatingUiTimeoutId !== null) {
            window.clearTimeout(this.floatingUiTimeoutId);
            this.floatingUiTimeoutId = null;
        }
    }

    private bootstrapFloatingUi(): void {
        this.ngZone.runOutsideAngular(() => {
            const enableFloatingUi = () => {
                this.removeFloatingUiBootstrapListeners?.();

                if (this.floatingUiTimeoutId !== null) {
                    window.clearTimeout(this.floatingUiTimeoutId);
                    this.floatingUiTimeoutId = null;
                }

                this.ngZone.run(() => {
                    this.showFloatingUi = true;
                });
            };

            const pointerHandler = () => enableFloatingUi();
            const scrollHandler = () => enableFloatingUi();
            const keydownHandler = () => enableFloatingUi();

            window.addEventListener('pointerdown', pointerHandler, { passive: true, once: true });
            window.addEventListener('touchstart', pointerHandler, { passive: true, once: true });
            window.addEventListener('scroll', scrollHandler, { passive: true, once: true });
            window.addEventListener('keydown', keydownHandler, { once: true });

            this.removeFloatingUiBootstrapListeners = () => {
                window.removeEventListener('pointerdown', pointerHandler);
                window.removeEventListener('touchstart', pointerHandler);
                window.removeEventListener('scroll', scrollHandler);
                window.removeEventListener('keydown', keydownHandler);
                this.removeFloatingUiBootstrapListeners = undefined;
            };

            this.floatingUiTimeoutId = window.setTimeout(() => {
                this.floatingUiTimeoutId = null;
                enableFloatingUi();
            }, 12000);
        });
    }
}


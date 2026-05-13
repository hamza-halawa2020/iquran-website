import { NgIf } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { fromEvent, Subscription } from 'rxjs';
import { auditTime } from 'rxjs/operators';

@Component({
    selector: 'app-back-to-top',
    standalone: true,
    imports: [NgIf],
    templateUrl: './back-to-top.component.html',
    styleUrl: './back-to-top.component.scss'
})
export class BackToTopComponent implements OnInit, OnDestroy {

    isShow: boolean = false;
    topPosToStartShowing = 100;
    private subscription = new Subscription();

    constructor(private ngZone: NgZone) { }

    ngOnInit(): void {
        this.ngZone.runOutsideAngular(() => {
            this.subscription.add(
                fromEvent(window, 'scroll', { passive: true })
                    .pipe(auditTime(100))
                    .subscribe(() => {
                        const isShown = this.getScrollPosition() >= this.topPosToStartShowing;

                        if (isShown !== this.isShow) {
                            this.ngZone.run(() => {
                                this.isShow = isShown;
                            });
                        }
                    })
            );
        });
    }

    ngOnDestroy(): void {
        this.subscription.unsubscribe();
    }

    private getScrollPosition(): number {
        return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    checkScroll() {
        this.isShow = this.getScrollPosition() >= this.topPosToStartShowing;
    }

    scrollToTop() {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    }

}

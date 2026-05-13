import { Directive, ElementRef, Input, OnDestroy, OnInit } from '@angular/core';

@Directive({
    selector: '[scrollReveal]',
    standalone: true,
})
export class ScrollRevealDirective implements OnInit, OnDestroy {
    @Input() revealDelay = 0;

    private observer!: IntersectionObserver;

    constructor(private el: ElementRef<HTMLElement>) { }

    ngOnInit(): void {
        const element = this.el.nativeElement;

        element.style.opacity = '0';
        element.style.transform = 'translate3d(0, 80px, 0) scale(0.96)';
        element.style.transition = 'none';
        element.style.willChange = 'opacity, transform';

        this.observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (!entry.isIntersecting) {
                        return;
                    }

                    window.setTimeout(() => {
                        element.style.transition = [
                            'opacity 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
                            'transform 1.1s cubic-bezier(0.16, 1, 0.3, 1)',
                        ].join(', ');
                        element.style.opacity = '1';
                        element.style.transform = 'translate3d(0, 0, 0) scale(1)';

                        element.addEventListener('transitionend', () => {
                            element.style.transform = '';
                            element.style.transition = '';
                            element.style.willChange = '';
                        }, { once: true });
                    }, this.revealDelay);

                    this.observer.unobserve(entry.target);
                });
            },
            { threshold: 0.05, rootMargin: '0px 0px -50px 0px' }
        );

        this.observer.observe(element);
    }

    ngOnDestroy(): void {
        this.observer?.disconnect();
    }
}

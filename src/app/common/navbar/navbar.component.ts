import { NgClass, NgIf, CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-navbar',
    standalone: true,
    imports: [
        CommonModule,
        RouterLink,
        RouterLinkActive,
        NgIf,
        NgClass,
        TranslateModule,
    ],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
    isCollapsed = true;
    isSticky: boolean = false;
    currentLanguage: string = 'en';
    private subscriptions = new Subscription();

    // Navigation menu items
    menuItems = [
        {
            label: 'HOME',
            route: '/'
        },

        {
            label: 'Courses',
            route: '/courses'
        },
        {
            label: 'Certificates',
            route: '/certificates'
        },
        {

            label: 'Articles',
            route: '/posts'
        },
        {
            label: 'MEDIA_GALLERY.TITLE',
            route: '/media'
        },
        {
            label: 'TESTIMONIALS',
            route: '/testimonials'
        },
        {
            label: 'Add Testimonial',
            route: '/add-testimonials'
        },
        {
            label: 'About',
            route: '/about'
        },

    ];

    // Languages available
    languages = [
        {
            code: 'en',
            name: 'English',
            flag: '🇺🇸'
        },
        {
            code: 'ar',
            name: 'العربية',
            flag: '🇸🇦'
        }
    ];

    constructor(
        public router: Router,
        private translate: TranslateService,
        private ngZone: NgZone
    ) {
        // Initialize languages
        this.translate.addLangs(['en', 'ar']);
        this.translate.setDefaultLang('en');

        // Load saved language from localStorage or use browser language
        const savedLang = localStorage.getItem('language');
        const browserLang = this.translate.getBrowserLang();
        const initialLang = savedLang || (browserLang?.match(/en|ar/) ? browserLang : 'en');

        this.translate.use(initialLang);
        this.currentLanguage = initialLang;
        this.applyLanguageDirection(initialLang);
    }

    ngOnInit(): void {
        // Keep high-frequency scroll work outside Angular and only re-enter when state changes.
        this.ngZone.runOutsideAngular(() => {
            this.subscriptions.add(
                fromEvent(window, 'scroll', { passive: true })
                    .pipe(auditTime(100))
                    .subscribe(() => {
                        const isSticky = this.getScrollPosition() >= 50;

                        if (isSticky !== this.isSticky) {
                            this.ngZone.run(() => {
                                this.isSticky = isSticky;
                            });
                        }
                    })
            );
        });

        // Update currentLanguage when language changes
        this.subscriptions.add(
            this.translate.onLangChange.subscribe((event) => {
                this.currentLanguage = event.lang;
                this.applyLanguageDirection(event.lang);
            })
        );
    }

    ngOnDestroy() {
        this.subscriptions.unsubscribe();
    }

    private getScrollPosition(): number {
        return window.scrollY || document.documentElement.scrollTop || document.body.scrollTop || 0;
    }

    switchLanguage(lang: string) {
        this.translate.use(lang);
        this.currentLanguage = lang;
        this.applyLanguageDirection(lang);
        localStorage.setItem('language', lang);

        // Close mobile menu after language switch
        this.isCollapsed = true;
    }

    getCurrentLanguage(): string {
        return this.currentLanguage || this.translate.getDefaultLang();
    }

    getCurrentLanguageData() {
        return this.languages.find(lang => lang.code === this.currentLanguage) || this.languages[0];
    }

    // Helper method to apply language direction
    private applyLanguageDirection(lang: string) {
        const htmlElement = document.documentElement;
        const bodyElement = document.body;

        if (lang === 'ar') {
            htmlElement.setAttribute('dir', 'rtl');
            htmlElement.setAttribute('lang', 'ar');
            bodyElement.classList.add('rtl');
            bodyElement.classList.remove('ltr');
        } else {
            htmlElement.setAttribute('dir', 'ltr');
            htmlElement.setAttribute('lang', 'en');
            bodyElement.classList.add('ltr');
            bodyElement.classList.remove('rtl');
        }
    }

    // Close mobile menu when clicking on a link
    closeMobileMenu() {
        this.isCollapsed = true;
    }

    // Toggle mobile menu
    toggleMobileMenu() {
        this.isCollapsed = !this.isCollapsed;
    }
}

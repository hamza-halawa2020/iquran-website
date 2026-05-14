import { NgClass, NgIf, CommonModule } from '@angular/common';
import { Component, NgZone, OnDestroy, OnInit } from '@angular/core';
import { RouterLink, RouterLinkActive, Router } from '@angular/router';
import { fromEvent, Subscription } from 'rxjs';
import { auditTime } from 'rxjs/operators';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { OrnamentCornersComponent } from '../../shared/components/ornament-corners/ornament-corners.component';

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
        OrnamentCornersComponent,
    ],
    templateUrl: './navbar.component.html',
    styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit, OnDestroy {
    isCollapsed = true;
    isSticky: boolean = false;
    currentLanguage: string = 'en';
    private subscriptions = new Subscription();
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
            label: 'About',
            route: '/about'
        },

    ];
    languages = [
        {
            code: 'en',
            name: 'English',
            flag: 'ðŸ‡ºðŸ‡¸'
        },
        {
            code: 'ar',
            name: 'Ø§Ù„Ø¹Ø±Ø¨ÙŠØ©',
            flag: 'ðŸ‡¸ðŸ‡¦'
        }
    ];

    constructor(
        public router: Router,
        private translate: TranslateService,
        private ngZone: NgZone
    ) {
        this.translate.addLangs(['en', 'ar']);
        this.translate.setDefaultLang('en');
        const savedLang = localStorage.getItem('language');
        const browserLang = this.translate.getBrowserLang();
        const initialLang = savedLang || (browserLang?.match(/en|ar/) ? browserLang : 'en');

        this.translate.use(initialLang);
        this.currentLanguage = initialLang;
        this.applyLanguageDirection(initialLang);
    }

    ngOnInit(): void {
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
        this.isCollapsed = true;
    }

    getCurrentLanguage(): string {
        return this.currentLanguage || this.translate.getDefaultLang();
    }

    getCurrentLanguageData() {
        return this.languages.find(lang => lang.code === this.currentLanguage) || this.languages[0];
    }
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
    closeMobileMenu() {
        this.isCollapsed = true;
    }
    toggleMobileMenu() {
        this.isCollapsed = !this.isCollapsed;
    }
}


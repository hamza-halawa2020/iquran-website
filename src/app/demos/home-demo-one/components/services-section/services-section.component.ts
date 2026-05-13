import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LatestCoursesSectionComponent } from '../latest-courses-section/latest-courses-section.component';
import { ScrollRevealDirective } from '../../../../shared/directives/scroll-reveal.directive';

@Component({
    selector: 'app-services-section',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule, LatestCoursesSectionComponent, ScrollRevealDirective],
    templateUrl: './services-section.component.html',
    styleUrls: ['./services-section.component.scss']
})
export class ServicesSectionComponent implements OnInit {
    @Input() courses: any[] = [];
    defaultServices: any[] = [];

    constructor(public translate: TranslateService) { }

    ngOnInit() {
        this.updateDefaultServices();
        this.translate.onLangChange.subscribe(() => {
            this.updateDefaultServices();
        });
    }

    updateDefaultServices() {
        this.defaultServices = [
            {
                id: 1,
                title: this.translate.instant('SERVICE_COURSES_TITLE'),
                description: this.translate.instant('SERVICE_COURSES_DESC'),
                icon: 'fa-book-quran', // Islamic icon for courses
                link: '/courses'
            },
            {
                id: 2,
                title: this.translate.instant('SERVICE_ARTICLES_TITLE'),
                description: this.translate.instant('SERVICE_ARTICLES_DESC'),
                icon: 'fa-scroll', // Islamic style icon for articles/knowledge
                link: '/posts'
            },
            {
                id: 3,
                title: this.translate.instant('SERVICE_TESTIMONIALS_TITLE'),
                description: this.translate.instant('SERVICE_TESTIMONIALS_DESC'),
                icon: 'fa-users-rays', // Community/Testimonials icon
                link: '/testimonials'
            }
        ];
    }
}

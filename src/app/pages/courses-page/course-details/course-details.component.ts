import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CoursesService } from '../courses.service';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-course-details',
    standalone: true,
    imports: [CommonModule, TranslateModule, RouterLink],
    templateUrl: './course-details.component.html',
    styleUrls: ['./course-details.component.scss']
})
export class CourseDetailsComponent implements OnInit {
    course: any;
    processedDescription = '';
    isLoading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private coursesService: CoursesService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.fetchDetails(id);
            }
        });
    }

    fetchDetails(id: string) {
        this.isLoading = true;
        this.coursesService.getCourseDetails(id).subscribe({
            next: (response: any) => {
                this.course = response.data;
                this.processedDescription = this.normalizeCourseHtml(this.course?.description || '');
                this.isLoading = false;
            },
            error: (error: any) => {
                this.isLoading = false;
            }
        });
    }

    private normalizeCourseHtml(html: string): string {
        if (!html || typeof window === 'undefined') {
            return html || '';
        }

        const parser = new DOMParser();
        const doc = parser.parseFromString(html, 'text/html');
        const backendBase = (environment.imgUrl || '').replace(/\/$/, '');

        doc.querySelectorAll('a').forEach((anchor) => {
            const href = anchor.getAttribute('href') || '';
            if (!href) {
                return;
            }

            if (href.startsWith('/')) {
                anchor.setAttribute('href', `${backendBase}${href}`);
            }

            anchor.setAttribute('target', '_blank');
            anchor.setAttribute('rel', 'noopener noreferrer');
        });

        doc.querySelectorAll('img').forEach((img) => {
            const src = img.getAttribute('src') || '';
            if (src.startsWith('/')) {
                img.setAttribute('src', `${backendBase}${src}`);
            }
        });

        return doc.body.innerHTML;
    }
}

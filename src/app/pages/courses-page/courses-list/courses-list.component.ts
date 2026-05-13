import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CoursesService } from '../courses.service';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { ContentCardComponent } from '../../../shared/components/content-card/content-card.component';

@Component({
    selector: 'app-courses-list',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule, PaginationComponent, ContentCardComponent],
    templateUrl: './courses-list.component.html',
    styleUrls: ['./courses-list.component.scss']
})
export class CoursesListComponent implements OnInit {
    courses: any[] = [];
    isLoading: boolean = true;
    meta: any;

    constructor(private coursesService: CoursesService) { }

    ngOnInit(): void {
        this.fetchCourses();
    }

    fetchCourses(page: number = 1) {
        this.isLoading = true;
        this.coursesService.getCoursesList(page).subscribe({
            next: (response: any) => {
                this.courses = response.data;
                this.meta = response.meta;
                this.isLoading = false;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            error: (error: any) => {
                this.isLoading = false;
            }
        });
    }

    onPageChange(page: number) {
        if (this.meta && page >= 1 && page <= this.meta.last_page && page !== this.meta.current_page) {
            this.fetchCourses(page);
        }
    }
}

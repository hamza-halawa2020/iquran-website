import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
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
    categories: any[] = [];
    isLoading: boolean = true;
    meta: any;
    selectedCategoryId: number | null = null;

    constructor(
        private coursesService: CoursesService,
        private route: ActivatedRoute,
        private router: Router
    ) { }

    ngOnInit(): void {
        this.fetchCategories();
        this.route.queryParamMap.subscribe((params) => {
            const categoryParam = params.get('category');
            this.selectedCategoryId = categoryParam ? Number(categoryParam) : null;
            if (Number.isNaN(this.selectedCategoryId)) {
                this.selectedCategoryId = null;
            }
            this.fetchCourses(1);
        });
    }

    fetchCourses(page: number = 1) {
        this.isLoading = true;
        this.coursesService.getCoursesList(page, this.selectedCategoryId).subscribe({
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

    fetchCategories() {
        this.coursesService.getCourseCategories().subscribe({
            next: (response: any) => {
                this.categories = response.data || [];
            },
            error: () => {
                this.categories = [];
            }
        });
    }

    onCategoryChange(categoryId: number | null) {
        this.router.navigate([], {
            relativeTo: this.route,
            queryParams: { category: categoryId || null },
            queryParamsHandling: 'merge'
        });
    }

    isCategoryActive(categoryId: number | null): boolean {
        return this.selectedCategoryId === categoryId;
    }

    onPageChange(page: number) {
        if (this.meta && page >= 1 && page <= this.meta.last_page && page !== this.meta.current_page) {
            this.fetchCourses(page);
        }
    }
}

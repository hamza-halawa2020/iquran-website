import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { TeachersService } from '../teachers.service';

@Component({
    selector: 'app-teachers-list',
    standalone: true,
    imports: [CommonModule, TranslateModule, PaginationComponent],
    templateUrl: './teachers-list.component.html',
    styleUrl: './teachers-list.component.scss'
})
export class TeachersListComponent implements OnInit {
    teachers: any[] = [];
    meta: any;
    isLoading = true;

    constructor(private teachersService: TeachersService) { }

    ngOnInit(): void {
        this.fetchTeachers(1);
    }

    fetchTeachers(page: number): void {
        this.isLoading = true;
        this.teachersService.getTeachers(page).subscribe({
            next: (response: any) => {
                this.teachers = response?.data || [];
                this.meta = response?.meta;
                this.isLoading = false;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            error: () => {
                this.teachers = [];
                this.meta = null;
                this.isLoading = false;
            }
        });
    }

    onPageChange(page: number): void {
        if (this.meta && page >= 1 && page <= this.meta.last_page && page !== this.meta.current_page) {
            this.fetchTeachers(page);
        }
    }
}

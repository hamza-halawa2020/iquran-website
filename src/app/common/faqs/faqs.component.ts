import { RouterLink } from '@angular/router';
import { CommonModule, NgClass, NgIf } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FaqsService } from './faqs.service';
import { NgbModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { PaginationComponent } from '../../shared/components/pagination/pagination.component';

@Component({
    selector: 'app-faqs',
    standalone: true,
    imports: [
        RouterLink,
        CommonModule,
        NgIf,
        NgClass,
        NgbModule,
        TranslateModule,
        PaginationComponent
    ],
    templateUrl: './faqs.component.html',
    styleUrl: './faqs.component.scss',
    providers: [FaqsService],
})
export class FaqsComponent implements OnInit {
    faqs: any[] = [];
    isLoading: boolean = true;
    meta: any;
    successMessage: string = '';
    errorMessage: string = '';

    constructor(
        private faqsService: FaqsService,
        public translateService: TranslateService
    ) {}

    ngOnInit(): void {
        this.fetchFaqs();
    }

    fetchFaqs(page: number = 1) {
        this.isLoading = true;
        this.faqsService.getFaqsList(page).subscribe({
            next: (response: any) => {
                this.faqs = response.data;
                this.meta = response.meta;
                this.isLoading = false;
                window.scrollTo({ top: 0, behavior: 'smooth' });
            },
            error: (error: any) => {
                this.errorMessage = this.translateService.instant('UNEXPECTED_ERROR');
                this.isLoading = false;
                setTimeout(() => {
                    this.errorMessage = '';
                }, 3000);
            }
        });
    }

    onPageChange(page: number) {
        if (this.meta && page >= 1 && page <= this.meta.last_page && page !== this.meta.current_page) {
            this.fetchFaqs(page);
        }
    }
}

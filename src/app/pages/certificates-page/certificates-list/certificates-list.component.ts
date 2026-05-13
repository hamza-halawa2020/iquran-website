import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { CertificatesService } from '../certificates.service';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';

@Component({
    selector: 'app-certificates-list',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule, PaginationComponent],
    templateUrl: './certificates-list.component.html',
    styleUrls: ['./certificates-list.component.scss']
})
export class CertificatesListComponent implements OnInit {
    certificates: any[] = [];
    isLoading: boolean = true;
    meta: any;
    fallbackImage: string = '/assets/images/logo.svg';

    constructor(private certificatesService: CertificatesService) { }

    ngOnInit(): void {
        this.fetchCertificates();
    }

    fetchCertificates(page: number = 1) {
        this.isLoading = true;
        this.certificatesService.getCertificatesList(page).subscribe({
            next: (response: any) => {
                this.certificates = response.data;
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
            this.fetchCertificates(page);
        }
    }

    onImageError(event: any) {
        event.target.src = this.fallbackImage;
    }
}

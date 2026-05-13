import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReviewsService } from '../reviews.service';
import { TranslateModule } from '@ngx-translate/core';
import { PaginationComponent } from '../../../shared/components/pagination/pagination.component';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

@Component({
  selector: 'app-reviews-list',
  standalone: true,
  imports: [CommonModule, RouterLink, TranslateModule, PaginationComponent, ReactiveFormsModule],
  templateUrl: './reviews-list.component.html',
  styleUrls: ['./reviews-list.component.scss']
})
export class ReviewsListComponent implements OnInit {
  reviews: any[] = [];
  isLoading: boolean = true;
  meta: any;
  reviewForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  errorMessage = '';

  constructor(
    private reviewsService: ReviewsService,
    private fb: FormBuilder
  ) {
    this.reviewForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      country: ['', [Validators.required, Validators.maxLength(255)]],
      review: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  ngOnInit(): void {
    this.fetchReviews();
  }

  fetchReviews(page: number = 1) {
    this.isLoading = true;
    this.reviewsService.getReviewsList(page).subscribe({
      next: (response: any) => {
        this.reviews = response.data;
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
      this.fetchReviews(page);
    }
  }

  formatDate(dateString: string): string {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      Object.keys(this.reviewForm.controls).forEach(key => {
        this.reviewForm.get(key)?.markAsTouched();
      });
      this.submitError = true;
      this.submitSuccess = false;
      this.errorMessage = 'Please fill all required fields correctly.';
      return;
    }

    this.isSubmitting = true;
    this.submitError = false;
    this.submitSuccess = false;

    const payload = {
      name: (this.reviewForm.value.name || '').trim(),
      country: (this.reviewForm.value.country || '').trim(),
      review: (this.reviewForm.value.review || '').trim()
    };

    this.reviewsService.addReview(payload).subscribe({
      next: () => {
        this.submitSuccess = true;
        this.isSubmitting = false;
        this.reviewForm.reset();
        this.fetchReviews(1);
      },
      error: (error: any) => {
        this.submitError = true;
        this.isSubmitting = false;
        this.errorMessage = error?.error?.message || 'Something went wrong. Please try again.';
      }
    });
  }

  get name() {
    return this.reviewForm.get('name');
  }

  get country() {
    return this.reviewForm.get('country');
  }

  get review() {
    return this.reviewForm.get('review');
  }
}

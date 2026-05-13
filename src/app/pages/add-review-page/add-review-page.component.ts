import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Router } from '@angular/router';
import { ReviewsService } from '../reviews-page/reviews.service';

@Component({
  selector: 'app-add-review-page',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TranslateModule],
  templateUrl: './add-review-page.component.html',
  styleUrl: './add-review-page.component.scss'
})
export class AddReviewPageComponent {
  reviewForm: FormGroup;
  isSubmitting = false;
  submitSuccess = false;
  submitError = false;
  errorMessage = '';

  constructor(
    private fb: FormBuilder,
    private reviewsService: ReviewsService,
    private router: Router
  ) {
    this.reviewForm = this.fb.group({
      name: ['', [Validators.required, Validators.maxLength(255)]],
      country: ['', [Validators.required, Validators.maxLength(255)]],
      review: ['', [Validators.required, Validators.minLength(10)]]
    });
  }

  onSubmit(): void {
    if (this.reviewForm.invalid) {
      Object.keys(this.reviewForm.controls).forEach(key => {
        this.reviewForm.get(key)?.markAsTouched();
      });
      return;
    }

    this.isSubmitting = true;
    this.submitError = false;
    this.submitSuccess = false;

    this.reviewsService.addReview(this.reviewForm.value).subscribe({
      next: (response) => {
        this.submitSuccess = true;
        this.isSubmitting = false;
        this.reviewForm.reset();
        
        // Redirect after 2 seconds
        setTimeout(() => {
          this.router.navigate(['/testimonials']);
        }, 2000);
      },
      error: (error) => {
        this.submitError = true;
        this.isSubmitting = false;
        this.errorMessage = error.error?.message || '';
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

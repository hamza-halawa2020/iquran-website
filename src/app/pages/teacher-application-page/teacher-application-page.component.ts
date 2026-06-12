import { CommonModule } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, ViewChild } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TeacherApplicationService } from './teacher-application.service';
import intlTelInput from 'intl-tel-input';

@Component({
    selector: 'app-teacher-application-page',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, TranslateModule],
    templateUrl: './teacher-application-page.component.html',
    styleUrl: './teacher-application-page.component.scss',
})
export class TeacherApplicationPageComponent implements AfterViewInit, OnDestroy {
    @ViewChild('phoneInput') phoneInput?: ElementRef<HTMLInputElement>;

    isSubmitting = false;
    successMessage = '';
    errorMessage = '';
    cvFile: File | null = null;
    cvFileName = '';
    cvError = '';
    private itiReady: Promise<unknown> = Promise.resolve();
    private iti?: {
        getNumber: () => string;
        isValidNumber: () => boolean;
        getSelectedCountryData: () => { dialCode?: string };
        destroy: () => void;
    };

    form = this.fb.group({
        name: ['', [Validators.required, Validators.minLength(2), Validators.maxLength(255)]],
        email: ['', [Validators.required, Validators.email, Validators.maxLength(255)]],
        phone: ['', [Validators.required, Validators.minLength(8), Validators.maxLength(20)]],
        country: ['', [Validators.required, Validators.maxLength(255)]],
        job_title: ['', [Validators.required, Validators.maxLength(255)]],
        message: ['', [Validators.required, Validators.minLength(10)]],
    });

    constructor(
        private fb: FormBuilder,
        private teacherApplicationService: TeacherApplicationService,
        public translate: TranslateService
    ) { }

    ngAfterViewInit(): void {
        if (!this.phoneInput?.nativeElement) {
            return;
        }

        this.iti = intlTelInput(this.phoneInput.nativeElement, {
            initialCountry: 'eg',
            preferredCountries: ['eg', 'sa', 'ae'],
            allowDropdown: true,
            countrySearch: true,
            separateDialCode: true,
            autoPlaceholder: 'polite',
            loadUtils: () => import('intl-tel-input/build/js/utils.js'),
        });
        this.itiReady = (this.iti as any)?.promise ?? Promise.resolve();
    }

    ngOnDestroy(): void {
        this.iti?.destroy();
    }

    onCvChange(event: Event): void {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        this.cvError = '';
        if (!file) return;
        if (file.type !== 'application/pdf') {
            this.cvError = 'Only PDF files are allowed.';
            return;
        }
        if (file.size > 5 * 1024 * 1024) {
            this.cvError = 'File size must not exceed 5MB.';
            return;
        }
        this.cvFile = file;
        this.cvFileName = file.name;
    }

    async submit(): Promise<void> {
        if (this.form.invalid) {
            this.form.markAllAsTouched();
            return;
        }

        this.isSubmitting = true;
        this.successMessage = '';
        this.errorMessage = '';

        await this.itiReady;

        const rawPhoneInput = this.phoneInput?.nativeElement?.value ?? '';
        const formattedPhone = (this.iti?.getNumber() || '').trim() || null;
        const isValidPhone = this.iti?.isValidNumber() ?? false;
        const dialCode = this.iti?.getSelectedCountryData?.().dialCode;
        const rawDigits = rawPhoneInput.replace(/[^\d]/g, '');
        const fallbackPhone = dialCode && rawDigits ? `+${dialCode}${rawDigits}` : null;
        const fallbackIsAcceptable = rawDigits.length >= 8 && rawDigits.length <= 15;

        if ((!formattedPhone || !isValidPhone) && !fallbackIsAcceptable) {
            this.form.get('phone')?.setErrors({ invalidPhone: true });
            this.form.get('phone')?.markAsTouched();
            this.isSubmitting = false;
            return;
        }

        const formValues = this.form.getRawValue();
        const fd = new FormData();
        fd.append('name', formValues.name ?? '');
        fd.append('email', formValues.email ?? '');
        fd.append('phone', formattedPhone || fallbackPhone || '');
        fd.append('country', formValues.country ?? '');
        fd.append('job_title', formValues.job_title ?? '');
        fd.append('message', formValues.message ?? '');
        if (this.cvFile) {
            fd.append('cv', this.cvFile);
        }

        this.teacherApplicationService.submit(fd).subscribe({
            next: () => {
                this.isSubmitting = false;
                this.form.reset();
                this.cvFile = null;
                this.cvFileName = '';
                this.successMessage = 'Your application has been submitted successfully and is now under review.';
            },
            error: (error) => {
                this.isSubmitting = false;
                this.errorMessage = error?.error?.message|| 'Something went wrong while submitting your application. Please try again.';
            },
        });
    }
}

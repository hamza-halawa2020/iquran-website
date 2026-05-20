import { CommonModule, NgClass, NgIf } from '@angular/common';
import { AfterViewInit, Component, ElementRef, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { ContactService } from './contact.service';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import {
    ReactiveFormsModule,
    FormBuilder,
    FormGroup,
    Validators,
} from '@angular/forms';
import { CoursesService } from '../../pages/courses-page/courses.service';
import intlTelInput from 'intl-tel-input';

@Component({
    selector: 'app-contact',
    standalone: true,
    imports: [RouterLink, CommonModule, NgIf, NgClass, ReactiveFormsModule, TranslateModule],
    templateUrl: './contact.component.html',
    styleUrl: './contact.component.scss',
    providers: [ContactService],
})
export class ContactComponent implements OnInit, AfterViewInit, OnDestroy {
    @ViewChild('phoneInput') phoneInput?: ElementRef<HTMLInputElement>;

    contactForm: FormGroup;
    successMessage: string = '';
    errorMessage: string = '';
    isSubmitting: boolean = false;
    categories: any[] = [];
    courses: any[] = [];
    private itiReady: Promise<unknown> = Promise.resolve();
    private iti?: {
        getNumber: () => string;
        isValidNumber: () => boolean;
        getSelectedCountryData: () => {
            name?: string;
            iso2?: string;
            dialCode?: string;
        };
        destroy: () => void;
    };

    constructor(
        public router: Router,
        private contactService: ContactService,
        private coursesService: CoursesService,
        private fb: FormBuilder,
        private translate: TranslateService
    ) {
        this.contactForm = this.fb.group({
            name: ['', [Validators.required, Validators.minLength(2)]],
            phone: ['', [Validators.required]],
            email: ['', [Validators.required, Validators.email]],
            age: ['', [Validators.required, Validators.min(1), Validators.max(120)]],
            country: ['', [Validators.required]],
            course_category_id: ['', [Validators.required]],
            course: ['', [Validators.required]],
            message: ['', [Validators.required, Validators.minLength(10)]],
        });
    }

    ngOnInit(): void {
        this.coursesService.getCourseCategories().subscribe({
            next: (response: any) => {
                this.categories = response?.data || [];
            },
            error: () => {
                this.categories = [];
            }
        });

        this.contactForm.get('course_category_id')?.valueChanges.subscribe((categoryId) => {
            this.contactForm.get('course')?.setValue('');
            this.loadCoursesByCategory(categoryId);
        });
    }

    private loadCoursesByCategory(categoryId: number | string | null): void {
        if (!categoryId) {
            this.courses = [];
            return;
        }

        this.coursesService.getCoursesList(1, Number(categoryId), 100).subscribe({
            next: (response: any) => {
                this.courses = response?.data || [];
            },
            error: () => {
                this.courses = [];
            }
        });
    }

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

    async onSubmit() {
        if (this.contactForm.invalid) {
            this.markFormGroupTouched();
            this.translate.get('CONTACT_FORM_INVALID').subscribe((translation: string) => {
                this.errorMessage = translation;
            });
            setTimeout(() => {
                this.errorMessage = '';
            }, 5000);
            return;
        }

        this.isSubmitting = true;
        this.errorMessage = '';
        this.successMessage = '';

        await this.itiReady;

        const rawPhoneInput = this.phoneInput?.nativeElement?.value ?? '';
        const formattedPhone = (this.iti?.getNumber() || '').trim() || null;
        const isValidPhone = this.iti?.isValidNumber() ?? false;
        const selectedCountryData = this.iti?.getSelectedCountryData?.();
        const rawDigits = rawPhoneInput.replace(/[^\d]/g, '');
        const fallbackDialCode = selectedCountryData?.dialCode ? `+${selectedCountryData.dialCode}` : '';
        const fallbackPhone = fallbackDialCode && rawDigits ? `${fallbackDialCode}${rawDigits}` : null;
        const fallbackIsAcceptable = rawDigits.length >= 8 && rawDigits.length <= 15;

        console.log('[Contact][Phone Debug]', {
            rawPhoneInput,
            formattedPhone,
            isValidPhone,
            selectedCountryData,
            fallbackPhone,
            fallbackIsAcceptable,
        });

        if ((!formattedPhone || !isValidPhone) && !fallbackIsAcceptable) {
            this.contactForm.get('phone')?.setErrors({ invalidPhone: true });
            this.contactForm.get('phone')?.markAsTouched();
            this.isSubmitting = false;
            return;
        }

        const payload = {
            ...this.contactForm.value,
            phone: formattedPhone || fallbackPhone,
        };

        this.contactService.store(payload).subscribe({
            next: () => {
                this.translate.get('CONTACT_SUCCESS_MESSAGE').subscribe((translation: string) => {
                    this.successMessage = translation;
                });
                this.contactForm.reset();
                this.isSubmitting = false;
                setTimeout(() => {
                    this.successMessage = '';
                }, 5000);
            },

            error: (error) => {
                this.isSubmitting = false;
                if (error.error?.errors) {
                    const errors = error.error.errors;
                    const errorMessages = Object.keys(errors).map(key =>
                        errors[key].join(', ')
                    ).join(' | ');
                    this.errorMessage = errorMessages;
                } else if (error.error?.message) {
                    this.errorMessage = error.error.message;
                } else {
                    this.translate.get('CONTACT_UNEXPECTED_ERROR').subscribe((translation: string) => {
                        this.errorMessage = translation;
                    });
                }
                setTimeout(() => {
                    this.errorMessage = '';
                }, 5000);
            },
        });
    }

    private markFormGroupTouched() {
        Object.keys(this.contactForm.controls).forEach(key => {
            const control = this.contactForm.get(key);
            control?.markAsTouched();
        });
    }

    getFieldError(fieldName: string): string {
        const field = this.contactForm.get(fieldName);
        if (field?.errors && field?.touched) {
            if (field.errors['required']) {
                if (fieldName === 'course_category_id') {
                    return 'Category is required';
                }
                return this.translate.instant(`${fieldName.toUpperCase()}_REQUIRED`);
            }
            if (field.errors['minlength']) {
                return this.translate.instant(`${fieldName.toUpperCase()}_MIN_LENGTH`);
            }
            if (field.errors['invalidPhone']) {
                return this.translate.instant('PHONE_INVALID');
            }
            if (field.errors['email']) {
                return this.translate.instant('EMAIL_INVALID');
            }
            if (field.errors['min'] || field.errors['max']) {
                return this.translate.instant('AGE_INVALID');
            }
        }
        return '';
    }
}

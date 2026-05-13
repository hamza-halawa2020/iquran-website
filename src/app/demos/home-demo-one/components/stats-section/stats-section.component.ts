import { Component, Input, ViewChild, ElementRef, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-stats-section',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './stats-section.component.html',
    styleUrls: ['./stats-section.component.scss']
})
export class StatsSectionComponent implements AfterViewInit {
    @Input() stats: any;
    @ViewChild('statsSection', { static: false }) statsSection!: ElementRef;

    animatedStats = {
        completedStudies: 0,
        satisfiedClients: 0,
        yearsExperience: 0,
        successPartners: 0
    };

    hasAnimated = false;

    defaultStats = {
        completedStudies: 1500,  // Students graduated
        satisfiedClients: 3200,  // Active students
        yearsExperience: 15,     // Years of teaching excellence
        successPartners: 45      // Qualified teachers
    };

    ngAfterViewInit(): void {
        setTimeout(() => {
            this.setupScrollObserver();
        }, 100);
    }

    setupScrollObserver(): void {
        if (!this.statsSection) {
            return;
        }

        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && !this.hasAnimated) {
                        this.startCounterAnimation();
                    }
                });
            },
            {
                threshold: 0.3,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        observer.observe(this.statsSection.nativeElement);
    }

    startCounterAnimation(): void {
        if (this.hasAnimated) {
            return;
        }

        this.hasAnimated = true;

        const currentStats = this.stats || this.defaultStats;

        if (this.statsSection) {
            const statCards = this.statsSection.nativeElement.querySelectorAll('.stat-card');
            statCards.forEach((card: HTMLElement) => {
                card.classList.add('counting');
            });

            setTimeout(() => {
                statCards.forEach((card: HTMLElement) => {
                    card.classList.remove('counting');
                });
            }, 3000);
        }

        this.animateCounter('completedStudies', currentStats.completedStudies, 2000);
        this.animateCounter('satisfiedClients', currentStats.satisfiedClients, 2500);
        this.animateCounter('yearsExperience', currentStats.yearsExperience, 1500);
        this.animateCounter('successPartners', currentStats.successPartners, 2200);
    }

    testCounter(): void {
        this.hasAnimated = false;
        this.resetCounters();
        setTimeout(() => {
            this.startCounterAnimation();
        }, 100);
    }

    private resetCounters(): void {
        this.animatedStats = {
            completedStudies: 0,
            satisfiedClients: 0,
            yearsExperience: 0,
            successPartners: 0
        };
    }

    private animateCounter(property: keyof typeof this.animatedStats, targetValue: number, duration: number): void {
        if (targetValue <= 0) {
            return;
        }

        const startValue = 0;
        const startTime = Date.now();

        const animate = () => {
            const elapsed = Date.now() - startTime;
            const progress = Math.min(elapsed / duration, 1);

            const easeOutQuart = 1 - Math.pow(1 - progress, 4);
            const currentValue = Math.floor(startValue + (targetValue - startValue) * easeOutQuart);

            this.animatedStats[property] = currentValue;

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                this.animatedStats[property] = targetValue;
            }
        };

        requestAnimationFrame(animate);

        setTimeout(() => {
            if (this.animatedStats[property] === 0) {
                let current = 0;
                const step = targetValue / 50;
                const interval = setInterval(() => {
                    current += step;
                    if (current >= targetValue) {
                        current = targetValue;
                        clearInterval(interval);
                    }
                    this.animatedStats[property] = Math.floor(current);
                }, 40);
            }
        }, 1000);
    }
}

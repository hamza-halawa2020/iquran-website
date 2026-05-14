import { CommonModule } from '@angular/common';
import { Component } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

type LearningBenefit = {
    icon: string;
    title: string;
    description: string;
};

@Component({
    selector: 'app-learning-benefits-section',
    standalone: true,
    imports: [CommonModule, TranslateModule],
    templateUrl: './learning-benefits-section.component.html',
    styleUrls: ['./learning-benefits-section.component.scss']
})
export class LearningBenefitsSectionComponent {
    constructor(public translate: TranslateService) {}

    benefits: LearningBenefit[] = [
        {
            icon: 'fa-solid fa-video',
            title: 'Live Zoom Classes',
            description: 'Interactive sessions to ask questions and learn with confidence.',
        },
        {
            icon: 'fa-solid fa-play-circle',
            title: 'Recorded Lessons',
            description: 'Review each lesson anytime to strengthen memorization.',
        },
        {
            icon: 'fa-solid fa-scroll',
            title: 'Learning Materials',
            description: 'Structured PDFs prepared for every level and goal.'
        },
        {
            icon: 'fa-solid fa-chalkboard-user',
            title: 'Expert Teachers',
            description: 'Qualified instructors with practical teaching experience.'
        },
        {
            icon: 'fa-solid fa-users',
            title: 'Small Groups',
            description: 'Better focus and personal attention in each class.'
        },
        {
            icon: 'fa-solid fa-hand-holding-heart',
            title: 'Continuous Support',
            description: 'Friendly guidance to keep your progress steady.'
        },
    ];
}

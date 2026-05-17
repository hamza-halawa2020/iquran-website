import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-latest-courses-section',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './latest-courses-section.component.html',
    styleUrls: ['./latest-courses-section.component.scss']
})
export class LatestCoursesSectionComponent {
    @Input() categories: any[] = [];
}

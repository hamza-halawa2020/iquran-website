import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-partners-section',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './partners-section.component.html',
    styleUrls: ['./partners-section.component.scss']
})
export class PartnersSectionComponent {
    @Input() partners: any[] = [];

    constructor(public translate: TranslateService) { }

    getImageUrl(imageUrl: string, fallback: string = 'assets/images/placeholder.jpg'): string {
        return imageUrl || fallback;
    }
}

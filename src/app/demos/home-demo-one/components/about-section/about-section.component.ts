import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';

@Component({
    selector: 'app-about-section',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './about-section.component.html',
    styleUrls: ['./about-section.component.scss']
})
export class AboutSectionComponent {
    @Input() stats: any;

    constructor(public translate: TranslateService) { }
}

import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { environment } from '../../../../environments/environment';

@Component({
    selector: 'app-content-card',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './content-card.component.html',
    styleUrls: ['./content-card.component.scss']
})
export class ContentCardComponent {
    @Input() item: any;
    @Input() routePath: string = '';
    @Input() animationDelay: number = 0;

    getImageUrl(): string {
        if (!this.item) return '';
        
        // If image_url exists, use it directly
        if (this.item.image_url) {
            return this.item.image_url;
        }
        
        // If only image filename exists, construct the full URL
        if (this.item.image) {
            return `${environment.imgUrl}storage/${this.item.image}`;
        }
        
        return '';
    }
}

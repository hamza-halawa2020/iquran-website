import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
    selector: 'app-hero-banner-section',
    standalone: true,
    imports: [RouterLink],
    templateUrl: './hero-banner-section.component.html',
    styleUrl: './hero-banner-section.component.scss',
})
export class HeroBannerSectionComponent {}


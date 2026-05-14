import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
    selector: 'app-ornament-corners',
    standalone: true,
    imports: [NgIf],
    templateUrl: './ornament-corners.component.html',
    styleUrls: ['./ornament-corners.component.scss'],
})
export class OrnamentCornersComponent {
    @Input() direction: 'up' | 'down' = 'up';
    @Input() side: 'left' | 'right' | 'both' = 'both';
    @Input() size: string = 'clamp(160px, 18vw, 320px)';
    @Input() opacity: number = 1;
    @Input() saturation: number = 1;
    @Input() brightness: number = 1;
    @Input() edgeOffset: string = '-6px';
    @Input() mirror: boolean = true;
    @Input() mirrorLeft?: boolean;
    @Input() mirrorRight?: boolean;
    @Input() flipY: boolean = false;
    @Input() imageUrl: string = '/assets/images/pngtree-islamic-corner-frame-png-image_7096173.svg';

    get shouldMirrorLeft(): boolean {
        return this.mirrorLeft ?? false;
    }

    get shouldMirrorRight(): boolean {
        return this.mirrorRight ?? this.mirror;
    }
}

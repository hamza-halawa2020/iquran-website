import { CommonModule } from '@angular/common';
import { Component, ElementRef, Input, ViewChild } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-teachers-section',
    standalone: true,
    imports: [CommonModule, RouterLink, TranslateModule],
    templateUrl: './teachers-section.component.html',
    styleUrl: './teachers-section.component.scss'
})
export class TeachersSectionComponent {
    @Input() teachers: any[] = [];
    @ViewChild('teachersTrack') private teachersTrack?: ElementRef<HTMLDivElement>;

    get hasMultipleTeachers(): boolean {
        return this.teachers.length > 1;
    }

    get isRtl(): boolean {
        return typeof document !== 'undefined' && document.dir === 'rtl';
    }

    scrollTeachers(direction: 'prev' | 'next'): void {
        const track = this.teachersTrack?.nativeElement;
        if (!track) {
            return;
        }

        const scrollAmount = Math.max(track.clientWidth * 0.9, 320);
        const delta = direction === 'next' ? scrollAmount : -scrollAmount;
        const normalizedDelta = this.isRtl ? -delta : delta;

        track.scrollBy({
            left: normalizedDelta,
            behavior: 'smooth'
        });
    }
}

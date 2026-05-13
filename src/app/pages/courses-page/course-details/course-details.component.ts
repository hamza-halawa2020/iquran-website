import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { CoursesService } from '../courses.service';
import { TranslateModule } from '@ngx-translate/core';

@Component({
    selector: 'app-course-details',
    standalone: true,
    imports: [CommonModule, TranslateModule, RouterLink],
    templateUrl: './course-details.component.html',
    styleUrls: ['./course-details.component.scss']
})
export class CourseDetailsComponent implements OnInit {
    course: any;
    isLoading: boolean = true;

    constructor(
        private route: ActivatedRoute,
        private coursesService: CoursesService
    ) { }

    ngOnInit(): void {
        this.route.paramMap.subscribe(params => {
            const id = params.get('id');
            if (id) {
                this.fetchDetails(id);
            }
        });
    }

    fetchDetails(id: string) {
        this.isLoading = true;
        this.coursesService.getCourseDetails(id).subscribe({
            next: (response: any) => {
                this.course = response.data;
                this.isLoading = false;
            },
            error: (error: any) => {
                this.isLoading = false;
            }
        });
    }
}

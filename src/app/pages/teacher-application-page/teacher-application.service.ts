import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type TeacherApplicationPayload = {
    name: string;
    email: string;
    phone: string;
    country: string;
    job_title: string;
    message: string;
};

@Injectable({
    providedIn: 'root',
})
export class TeacherApplicationService {
    private apiUrl = environment.backEndUrl;

    constructor(private http: HttpClient) { }

    submit(payload: TeacherApplicationPayload) {
        return this.http.post(`${this.apiUrl}/teacher-applications`, payload);
    }
}

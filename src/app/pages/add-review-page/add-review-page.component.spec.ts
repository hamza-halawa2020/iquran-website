import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddReviewPageComponent } from './add-review-page.component';

describe('AddReviewPageComponent', () => {
  let component: AddReviewPageComponent;
  let fixture: ComponentFixture<AddReviewPageComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AddReviewPageComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AddReviewPageComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

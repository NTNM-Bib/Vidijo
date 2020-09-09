import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddCategoryThumbnailComponent } from './add-category-thumbnail.component';

describe('AddCategoryThumbnailComponent', () => {
  let component: AddCategoryThumbnailComponent;
  let fixture: ComponentFixture<AddCategoryThumbnailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddCategoryThumbnailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddCategoryThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

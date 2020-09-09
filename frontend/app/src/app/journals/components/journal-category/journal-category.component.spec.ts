import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalCategoryComponent } from './journal-category.component';

describe('JournalCategoryComponent', () => {
  let component: JournalCategoryComponent;
  let fixture: ComponentFixture<JournalCategoryComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalCategoryComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalCategoryComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

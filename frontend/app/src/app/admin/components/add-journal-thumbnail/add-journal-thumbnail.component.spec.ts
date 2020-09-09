import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AddJournalThumbnailComponent } from './add-journal-thumbnail.component';

describe('AddJournalThumbnailComponent', () => {
  let component: AddJournalThumbnailComponent;
  let fixture: ComponentFixture<AddJournalThumbnailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ AddJournalThumbnailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(AddJournalThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

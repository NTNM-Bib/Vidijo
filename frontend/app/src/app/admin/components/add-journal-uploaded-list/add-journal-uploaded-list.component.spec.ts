import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AddJournalUploadedListComponent } from './add-journal-uploaded-list.component';

describe('AddJournalUploadedListComponent', () => {
  let component: AddJournalUploadedListComponent;
  let fixture: ComponentFixture<AddJournalUploadedListComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ AddJournalUploadedListComponent ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    fixture = TestBed.createComponent(AddJournalUploadedListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

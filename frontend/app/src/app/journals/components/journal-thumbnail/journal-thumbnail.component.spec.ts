import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalThumbnailComponent } from './journal-thumbnail.component';

describe('JournalThumbnailComponent', () => {
  let component: JournalThumbnailComponent;
  let fixture: ComponentFixture<JournalThumbnailComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalThumbnailComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalThumbnailComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

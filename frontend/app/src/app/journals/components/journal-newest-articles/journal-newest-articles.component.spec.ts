import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalNewestArticlesComponent } from './journal-newest-articles.component';

describe('JournalNewestArticlesComponent', () => {
  let component: JournalNewestArticlesComponent;
  let fixture: ComponentFixture<JournalNewestArticlesComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalNewestArticlesComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalNewestArticlesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

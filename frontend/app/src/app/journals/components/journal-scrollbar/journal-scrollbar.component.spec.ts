import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalScrollbarComponent } from './journal-scrollbar.component';

describe('JournalScrollbarComponent', () => {
  let component: JournalScrollbarComponent;
  let fixture: ComponentFixture<JournalScrollbarComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalScrollbarComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalScrollbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

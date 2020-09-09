import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalCoverComponent } from './journal-cover.component';

describe('JournalCoverComponent', () => {
  let component: JournalCoverComponent;
  let fixture: ComponentFixture<JournalCoverComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalCoverComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalCoverComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { JournalGridComponent } from './journal-grid.component';

describe('JournalGridComponent', () => {
  let component: JournalGridComponent;
  let fixture: ComponentFixture<JournalGridComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ JournalGridComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(JournalGridComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

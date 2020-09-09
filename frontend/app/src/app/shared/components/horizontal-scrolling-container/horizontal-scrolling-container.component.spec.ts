import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { HorizontalScrollingContainerComponent } from './horizontal-scrolling-container.component';

describe('HorizontalScrollingContainerComponent', () => {
  let component: HorizontalScrollingContainerComponent;
  let fixture: ComponentFixture<HorizontalScrollingContainerComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ HorizontalScrollingContainerComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(HorizontalScrollingContainerComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

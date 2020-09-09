import { Component, OnInit, Input, ViewEncapsulation } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-horizontal-scrolling-container',
  templateUrl: './horizontal-scrolling-container.component.html',
  styleUrls: ['./horizontal-scrolling-container.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class HorizontalScrollingContainerComponent implements OnInit {

  @Input() containerHeight: string = "150px";
  @Input() containerWidth: string = "100%";
  @Input() itemsPerPage: number = 2;

  itemHeight: number = 300;
  itemWidth: number = 400;

  isMobile: boolean;


  constructor(
    private breakpointObserver: BreakpointObserver
  ) { }


  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });
  }

}

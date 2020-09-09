import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/core/navigation/navigation.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';



@Component({
  selector: 'app-add-category-thumbnail',
  templateUrl: './add-category-thumbnail.component.html',
  styleUrls: ['./add-category-thumbnail.component.scss']
})
export class AddCategoryThumbnailComponent implements OnInit {

  isMobile: boolean;

  constructor(
    private navigationService: NavigationService,
    private breakpointObserver: BreakpointObserver
  ) { }


  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });
  }


  navigateToAddCategory() {
    this.navigationService.navigateToAddCategory();
  }

}

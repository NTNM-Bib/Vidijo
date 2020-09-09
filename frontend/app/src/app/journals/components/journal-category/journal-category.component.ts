import { Component, OnInit, Input } from '@angular/core';
import { ICategory } from '../../shared/category.interface';
import { BreakpointObserver, BreakpointState, Breakpoints } from '@angular/cdk/layout';
import * as Color from "color";
import { AdminService } from 'src/app/admin/shared/admin.service';
import { NavigationService } from 'src/app/core/navigation/navigation.service';

@Component({
  selector: 'app-journal-category',
  templateUrl: './journal-category.component.html',
  styleUrls: ['./journal-category.component.scss']
})
export class JournalCategoryComponent implements OnInit {

  @Input() category: ICategory;
  @Input() specialIcon: string;  // mat-icon string for special categories (favorites, all journals)

  colors: string[] = []
  isMobile: boolean = true;
  adminModeActive: boolean = false;


  constructor(
    private breakpointObserver: BreakpointObserver,
    private adminService: AdminService,
    private navigationService: NavigationService
  ) { }


  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    // Special category is white
    if (this.specialIcon) {
      this.category.color = "#ffffff";
    }

    const color0: string = Color(this.category.color).toString();
    const color1: string = Color(this.category.color).darken(.1).toString();
    const color2: string = Color(this.category.color).darken(.2).toString();
    const color3: string = Color(this.category.color).darken(.3).toString();
    this.colors.push(color0);
    this.colors.push(color1);
    this.colors.push(color2);
    this.colors.push(color3);

    this.adminService.adminModeActive.subscribe((active: boolean) => {
      this.adminModeActive = active;
    });
  }


  navigateToEditCategory() {
    this.navigationService.navigateToEditCategory(this.category._id);
  }


  get isSpecialCategory(): boolean {
    return this.category._id === "all" || this.category._id === "favorites" || this.category._id === "";
  }

}

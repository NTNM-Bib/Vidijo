import { Component, OnInit, HostListener } from '@angular/core';
import { ICategory } from '../../shared/category.interface';
import { JournalService } from '../../shared/journal.service';
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints
} from "@angular/cdk/layout";
import { Title } from '@angular/platform-browser';
import { IColor } from '../../shared/color.interface';
import { AuthService } from 'src/app/auth/auth.service';
import { IUser } from 'src/app/users/shared/user.interface';
import { AdminService } from 'src/app/admin/shared/admin.service';
import { ActivatedRoute } from '@angular/router';
import { ICategoriesPage } from '../../shared/categories-page.interface';



@Component({
  selector: 'app-categories',
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {

  isMobile: boolean = false;
  isLoggedIn: boolean = false;
  adminModeActive: boolean = false;

  allJournalsCategory: ICategory = {
    _id: "",
    title: "All Journals"
  } as ICategory

  favoritesCategory: ICategory = {
    _id: "favorites",
    title: "My Favorites"
  } as ICategory;

  categories: ICategory[] = [];


  constructor(
    private journalService: JournalService,
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private adminService: AdminService,
    private activatedRoute: ActivatedRoute
  ) { }


  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.adminService.adminModeActive.subscribe((active: boolean) => {
      this.adminModeActive = active;
    });

    this.authService.currentUser.subscribe((user: IUser) => {
      this.isLoggedIn = user !== null;
    });

    this.activatedRoute.queryParams.subscribe(async () => {
      await this.getCategoriesPage();
    });
  }


  async getCategoriesPage() {
    const categoriesPage: ICategoriesPage = await this.journalService.getCategoriesPage().catch();

    this.categories = categoriesPage.categories;
  }

}

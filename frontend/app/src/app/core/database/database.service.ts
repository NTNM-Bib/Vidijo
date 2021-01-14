import { Injectable } from "@angular/core";
import { IHomePage } from "src/app/journals/shared/home-page.interface";
import { IDiscoverPage } from "src/app/journals/shared/discover-page.interface";
import { ICategoriesPage } from "src/app/journals/shared/categories-page.interface";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  private _homePage: IHomePage;
  private _discoverPage: IDiscoverPage;
  private _categoriesPage: ICategoriesPage;

  constructor() {}

  public flushCache() {
    console.log("FLUSHING DATABASE CACHE...");

    this.flushHomePage();
    this.flushDiscoverPage();
    this.flushCategoriesPage();
  }

  public cacheHomePage(homePage: IHomePage) {
    this._homePage = homePage;
  }

  public getHomePage(): IHomePage {
    return this._homePage;
  }

  public flushHomePage() {
    this._homePage = null;
    console.log("HOME PAGE FLUSHED: ", this._homePage);
  }

  public cacheDiscoverPage(discoverPage: IDiscoverPage) {
    this._discoverPage = discoverPage;
  }

  public get discoverPage(): IDiscoverPage {
    return this._discoverPage;
  }

  public flushDiscoverPage() {
    this._discoverPage = null;
  }

  public cacheCategoriesPage(categoriesPage: ICategoriesPage) {
    this._categoriesPage = categoriesPage;
  }

  public getCategoriesPage(): ICategoriesPage {
    return this._categoriesPage;
  }

  public flushCategoriesPage() {
    this._categoriesPage = null;
  }
}

import { Injectable } from "@angular/core";
import { IHomePage } from "src/app/journals/shared/home-page.interface";
import { IDiscoverPage } from "src/app/journals/shared/discover-page.interface";
import { IJournalsPage } from "src/app/journals/shared/journals-page.interface";
import { ICategoriesPage } from "src/app/journals/shared/categories-page.interface";
import { ISearchPage } from "src/app/journals/shared/search-page.interface";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  private _homePage: IHomePage;
  private _discoverPage: IDiscoverPage;
  private _journalsPage: IJournalsPage;
  private _categoriesPage: ICategoriesPage;
  private _searchPage: ISearchPage;

  constructor() {}

  public flushCache() {
    this.flushHomePage();
    this.flushDiscoverPage();
    this.flushCategoriesPage();
  }

  public cacheHomePage(homePage: IHomePage) {
    this._homePage = homePage;
  }

  get homePage(): IHomePage {
    return this._homePage;
  }

  public getHomePage() {}

  public flushHomePage() {
    this._homePage = null;
  }

  public cacheDiscoverPage(discoverPage: IDiscoverPage) {
    this._discoverPage = discoverPage;
  }

  public getDiscoverPage(): IDiscoverPage {
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

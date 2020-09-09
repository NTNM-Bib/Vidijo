import { Injectable } from '@angular/core';
import { IHomePage } from 'src/app/journals/shared/home-page.interface';
import { IDiscoverPage } from 'src/app/journals/shared/discover-page.interface';
import { IJournalsPage } from 'src/app/journals/shared/journals-page.interface';
import { ICategoriesPage } from 'src/app/journals/shared/categories-page.interface';
import { ISearchPage } from 'src/app/journals/shared/search-page.interface';


@Injectable({
  providedIn: 'root'
})
export class DatabaseService {

  private homePage: IHomePage;
  private discoverPage: IDiscoverPage;
  private journalsPage: IJournalsPage;
  private categoriesPage: ICategoriesPage;
  private searchPage: ISearchPage;


  constructor() {

  }


  public flushCache() {
    this.flushHomePage();
    this.flushDiscoverPage();
    this.flushCategoriesPage();
  }


  public cacheHomePage(homePage: IHomePage) {
    this.homePage = homePage;
  }


  public getHomePage(): IHomePage {
    return this.homePage;
  }


  public flushHomePage() {
    this.homePage = null;
  }


  public cacheDiscoverPage(discoverPage: IDiscoverPage) {
    this.discoverPage = discoverPage;
  }


  public getDiscoverPage(): IDiscoverPage {
    return this.discoverPage;
  }


  public flushDiscoverPage() {
    this.discoverPage = null;
  }
  

  public cacheCategoriesPage(categoriesPage: ICategoriesPage) {
    this.categoriesPage = categoriesPage;
  }


  public getCategoriesPage(): ICategoriesPage {
    return this.categoriesPage;
  }


  public flushCategoriesPage() {
    this.categoriesPage = null;
  }

}

import { Injectable } from "@angular/core";
import { IHomePage } from "src/app/journals/shared/home-page.interface";
import { IDiscoverPage } from "src/app/journals/shared/discover-page.interface";
import { ICategoriesPage } from "src/app/journals/shared/categories-page.interface";
import { ReplaySubject } from "rxjs";
import { IsLoadingService } from "@service-work/is-loading";
import { environment } from "src/environments/environment";
import Axios from "axios";
import { IJournalsPage } from "src/app/journals/shared/journals-page.interface";
import * as LocalForage from "localforage";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  public homePageData$: ReplaySubject<IHomePage> = new ReplaySubject<IHomePage>();
  public discoverPageData$: ReplaySubject<IDiscoverPage> = new ReplaySubject<IDiscoverPage>();
  public journalsPageData$: ReplaySubject<IJournalsPage> = new ReplaySubject<IJournalsPage>();
  public categoriesPageData$: ReplaySubject<ICategoriesPage> = new ReplaySubject<ICategoriesPage>();

  public isUsingCache$: ReplaySubject<boolean> = new ReplaySubject<boolean>();

  private vidijoApiUrl = environment.vidijoApiUrl;

  private currentCategory: string = "";
  private currentSort: string = "";

  constructor(private isLoadingService: IsLoadingService) {
    // Initialize client side database
    this.initLocalForage();
    this.loadFromLocalForage();
    this.localForageListenToChanges();

    this.reloadData();

    this.journalsPageData$.subscribe((data) => {
      this.currentCategory = data?.category?._id;
      this.currentSort = data?.sort;
    });

    this.retryOnDisconnect();
  }

  public reloadData() {
    this.isLoadingService.add();

    Promise.all([
      this.loadHomePageData(),
      this.loadDiscoverPageData(),
      this.loadJournalsPageData(),
      this.loadCategoriesPageData(),
    ])
      .then(() => {
        this.isLoadingService.remove();
        this.isUsingCache$.next(false);
      })
      .catch((_) => {
        this.isLoadingService.remove();
        this.isUsingCache$.next(true);
      });
  }

  public reloadJournalsPageIfParamsChanged(
    category: string = "all",
    sort: string = "+title"
  ) {
    if (category === this.currentCategory && sort === this.currentSort) return;

    this.isLoadingService.add();
    this.loadJournalsPageData(category, sort)
      .then(() => {
        this.isLoadingService.remove();
        this.isUsingCache$.next(false);
      })
      .catch((err) => {
        this.isLoadingService.remove();
        this.isUsingCache$.next(true);
      });
  }

  async loadHomePageData() {
    const response = await Axios.get(`${this.vidijoApiUrl}/pages/home`, {
      withCredentials: true,
    });

    this.homePageData$.next(response.data);
  }

  async loadDiscoverPageData() {
    const response = await Axios.get(`${this.vidijoApiUrl}/pages/discover`, {
      withCredentials: true,
    });

    this.discoverPageData$.next(response.data);
  }

  async loadCategoriesPageData() {
    const response = await Axios.get(`${this.vidijoApiUrl}/pages/categories`, {
      withCredentials: true,
    });

    this.categoriesPageData$.next(response.data);
  }

  async loadJournalsPageData(
    category: string = "all",
    sort: string = "+title"
  ) {
    const response = await Axios.get(
      `${this.vidijoApiUrl}/pages/journals?category=${category}&sort=${sort}`,
      {
        withCredentials: true,
      }
    );

    this.journalsPageData$.next(response.data);
  }

  private initLocalForage() {
    LocalForage.config({
      driver: LocalForage.INDEXEDDB,
      name: "Vidijo",
    });
  }

  private loadFromLocalForage() {
    Promise.all([
      LocalForage.getItem("homePage"),
      LocalForage.getItem("discoverPage"),
      LocalForage.getItem("journalsPage"),
      LocalForage.getItem("categoriesPage"),
    ]).then(
      ([home, discover, journals, categories]: [
        string,
        string,
        string,
        string
      ]) => {
        this.homePageData$.next(JSON.parse(home));
        this.discoverPageData$.next(JSON.parse(discover));
        this.journalsPageData$.next(JSON.parse(journals));
        this.categoriesPageData$.next(JSON.parse(categories));
      }
    );
  }

  private localForageListenToChanges() {
    this.homePageData$.subscribe((data) => {
      LocalForage.setItem("homePage", JSON.stringify(data));
    });
    this.discoverPageData$.subscribe((data) => {
      LocalForage.setItem("discoverPage", JSON.stringify(data));
    });
    this.journalsPageData$.subscribe((data) => {
      LocalForage.setItem("journalsPage", JSON.stringify(data));
    });
    this.categoriesPageData$.subscribe((data) => {
      LocalForage.setItem("categoriesPage", JSON.stringify(data));
    });
  }

  private delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  private retryOnDisconnect() {
    this.isUsingCache$.subscribe((offline: boolean) => {
      if (!offline) return;

      console.log("Connection lost! Retrying...");
      this.delay(5000).then(() => {
        this.reloadData();
      });
    });
  }
}

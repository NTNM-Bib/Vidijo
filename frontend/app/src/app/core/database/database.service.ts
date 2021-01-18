import { Injectable } from "@angular/core";
import { IHomePage } from "src/app/journals/shared/home-page.interface";
import { IDiscoverPage } from "src/app/journals/shared/discover-page.interface";
import { ICategoriesPage } from "src/app/journals/shared/categories-page.interface";
import { ReplaySubject } from "rxjs";
import { IsLoadingService } from "@service-work/is-loading";
import { environment } from "src/environments/environment";
import Axios from "axios";
import { IJournalsPage } from "src/app/journals/shared/journals-page.interface";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  public homePageData$: ReplaySubject<IHomePage> = new ReplaySubject<IHomePage>();
  public discoverPageData$: ReplaySubject<IDiscoverPage> = new ReplaySubject<IDiscoverPage>();
  public journalsPageData$: ReplaySubject<IJournalsPage> = new ReplaySubject<IJournalsPage>();
  public categoriesPageData$: ReplaySubject<ICategoriesPage> = new ReplaySubject<ICategoriesPage>();

  private vidijoApiUrl = environment.vidijoApiUrl;

  private currentCategory: string = "";
  private currentSort: string = "";

  constructor(private isLoadingService: IsLoadingService) {
    this.reloadData();

    this.journalsPageData$.subscribe((data) => {
      this.currentCategory = data?.category?._id;
      this.currentSort = data?.sort;
    });
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
      })
      .catch((err) => {
        this.isLoadingService.remove();
      });
  }

  public reloadJournalsPageIfParamsChanged(
    category: string = "all",
    sort: string = "+title"
  ) {
    if (category === this.currentCategory && sort === this.currentSort) return;

    this.isLoadingService.add();
    this.loadJournalsPageData(category, sort).then(() => {
      this.isLoadingService.remove();
    });
  }

  public loadMoreJournalsForJournalsPage(
    category: string = "all",
    sort: string = "+title"
  ) {
    // TODO: IMPLEMENT
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
}

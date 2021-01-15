import { Injectable } from "@angular/core";
import { IHomePage } from "src/app/journals/shared/home-page.interface";
import { IDiscoverPage } from "src/app/journals/shared/discover-page.interface";
import { ICategoriesPage } from "src/app/journals/shared/categories-page.interface";
import { Observable, ReplaySubject, Subject, Subscription } from "rxjs";
import { IsLoadingService } from "@service-work/is-loading";
import { environment } from "src/environments/environment";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import Axios from "axios";

@Injectable({
  providedIn: "root",
})
export class DatabaseService {
  public homePageData$: ReplaySubject<IHomePage> = new ReplaySubject<IHomePage>();
  public discoverPageData$: ReplaySubject<IDiscoverPage> = new ReplaySubject<IDiscoverPage>();
  public categoriesPageData$: ReplaySubject<ICategoriesPage> = new ReplaySubject<ICategoriesPage>();

  private vidijoApiUrl = environment.vidijoApiUrl;

  constructor(private isLoadingService: IsLoadingService) {
    this.reloadData();
  }

  public reloadData() {
    this.isLoadingService.add();

    Promise.all([
      this.loadHomePageData(),
      this.loadDiscoverPageData(),
      this.loadCategoriesPageData(),
    ])
      .then(() => {
        this.isLoadingService.remove();
      })
      .catch((err) => {
        this.isLoadingService.remove();
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
}

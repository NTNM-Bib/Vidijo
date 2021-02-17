import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, of, Subject } from "rxjs";
import { environment } from "../../../environments/environment";
import { IJournal } from "../shared/journal.interface";
import { IArticle } from "../shared/article.interface";
import { ICategory } from "./category.interface";
import { IsLoadingService } from "@service-work/is-loading";
import { IJournalsPage } from "./journals-page.interface";
import { ISearchPage } from "./search-page.interface";
import { DatabaseService } from "src/app/core/database/database.service";
import { catchError, map, tap } from "rxjs/operators";

const httpOptions = {
  headers: new HttpHeaders({ "Content-Type": "application/json" }),
  withCredentials: true,
};

@Injectable({
  providedIn: "root",
})
export class JournalService {
  vidijoApiUrl = environment.vidijoApiUrl;

  constructor(
    private http: HttpClient,
    private isLoadingService: IsLoadingService,
    private databaseService: DatabaseService
  ) {}

  // =-- Admin Functionality --=
  updateJournal(journal: IJournal): Promise<IJournal> {
    const promise: Promise<IJournal> = new Promise((resolve, reject) => {
      this.isLoadingService.add();
      this.http
        .patch<IJournal>(
          `${this.vidijoApiUrl}/journals/${journal._id}`,
          journal,
          httpOptions
        )
        .subscribe(
          (updatedJournal: IJournal) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return resolve(updatedJournal);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return reject(err);
          }
        );
    });

    return promise;
  }
  // =-- Admin Functionality End --=

  getJournalsPage(
    category: string = "",
    sort: string = "+title"
  ): Promise<IJournalsPage> {
    const promise: Promise<IJournalsPage> = new Promise((resolve, reject) => {
      this.isLoadingService.add();

      this.http
        .get<IJournalsPage>(
          `${this.vidijoApiUrl}/pages/journals?category=${category}&sort=${sort}`,
          httpOptions
        )
        .subscribe(
          (journalsPage: IJournalsPage) => {
            this.isLoadingService.remove();
            return resolve(journalsPage);
          },
          (err: any) => {
            this.isLoadingService.remove();
            return reject(new Error("Cannot load journals page data"));
          }
        );
    });

    return promise;
  }

  getSearchPage(searchQuery: string = ""): Promise<ISearchPage> {
    const promise: Promise<ISearchPage> = new Promise((resolve, reject) => {
      this.isLoadingService.add();

      this.http
        .get<ISearchPage>(
          `${this.vidijoApiUrl}/pages/search?q=${searchQuery}`,
          httpOptions
        )
        .subscribe(
          (searchPage: ISearchPage) => {
            this.isLoadingService.remove();
            return resolve(searchPage);
          },
          (err: any) => {
            this.isLoadingService.remove();
            return reject(new Error("Cannot load search page data"));
          }
        );
    });

    return promise;
  }

  // Get a journal by its ID
  getJournal(journalId: string): Observable<IJournal> {
    return this.http.get<IJournal>(
      `${this.vidijoApiUrl}/journals/${journalId}`,
      httpOptions
    );
  }

  // Get articles published in the journal with given ID
  getArticles(query: string = ""): Observable<IArticle[]> {
    return this.http
      .get<any>(`${this.vidijoApiUrl}/articles${query}`, httpOptions)
      .pipe(map((v) => v.docs ?? []));
  }

  // Get an article by its ID
  getArticle(id: string): Observable<IArticle> {
    // Get from server
    return this.http.get<IArticle>(
      `${this.vidijoApiUrl}/articles/${id}`,
      httpOptions
    );
  }

  // Get journals by their category, sort them and limit the resulting array if needed
  getJournals(query: string = ""): Observable<IJournal[]> {
    return this.http.get<IJournal[]>(
      `${this.vidijoApiUrl}/journals${query}`,
      httpOptions
    );
  }

  // Get a category by its ID
  getCategory(categoryId: string): Promise<ICategory> {
    const promise: Promise<ICategory> = new Promise((resolve, reject) => {
      this.isLoadingService.add();
      this.http
        .get<ICategory>(
          `${this.vidijoApiUrl}/categories/${categoryId}`,
          httpOptions
        )
        .subscribe(
          (category: ICategory) => {
            this.isLoadingService.remove();
            return resolve(category);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            return reject(err);
          }
        );
    });

    return promise;
  }

  searchCategories(
    searchTerm: string,
    limit: number = 10,
    sort: string = "+title"
  ): Observable<ICategory[]> {
    return this.http.get<ICategory[]>(
      `${this.vidijoApiUrl}/categories?search=${searchTerm}&limit=${limit}&sort=${sort}`,
      httpOptions
    );
  }
}

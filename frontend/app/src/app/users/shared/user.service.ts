import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, Subject } from "rxjs";
import { environment } from "../../../environments/environment";
import { IUser } from "./user.interface";
import { IArticle } from "src/app/journals/shared/article.interface";
import { DatabaseService } from "src/app/core/database/database.service";
import { AuthService } from "src/app/auth/auth.service";
import { IsLoadingService } from "@service-work/is-loading";

@Injectable({
  providedIn: "root",
})
export class UserService {
  private httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
    withCredentials: true,
  };
  private vidijoApiUrl = environment.vidijoApiUrl;

  constructor(
    private http: HttpClient,
    private databaseService: DatabaseService,
    private authService: AuthService,
    private isLoadingService: IsLoadingService
  ) {}

  public isInReadingList(articleId: string): boolean {
    if (
      !(
        this.authService.currentUserValue &&
        this.authService.currentUserValue.readingList
      )
    ) {
      return false;
    }

    return this.authService.currentUserValue.readingList.includes(articleId);
  }

  public isAFavoriteJournal(journalId: string): boolean {
    if (
      !(
        this.authService.currentUserValue &&
        this.authService.currentUserValue.favoriteJournals
      )
    ) {
      return false;
    }

    return this.authService.currentUserValue.favoriteJournals.includes(
      journalId
    );
  }

  public addFavoriteJournal(journalId: string): Promise<IUser> {
    const promise: Promise<IUser> = new Promise((resolve, reject) => {
      // Local change
      let user = this.authService.currentUserValue;
      if (!user.favoriteJournals.includes(journalId)) {
        user.favoriteJournals.push(journalId);
      }
      this.authService.currentUser.next(user);

      // Sync with server
      this.isLoadingService.add();
      this.http
        .post<IUser>(
          `${this.vidijoApiUrl}/users/me/favoriteJournals/${journalId}`,
          {},
          this.httpOptions
        )
        .subscribe(
          (user: IUser) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return resolve(user);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            // Reset local change
            let user = this.authService.currentUserValue;
            user.favoriteJournals = user.favoriteJournals.filter((value) => {
              return value !== journalId;
            });
            this.authService.currentUser.next(user);

            return reject(err);
          }
        );
    });

    return promise;
  }

  public removeFavoriteJournal(journalId: string): Promise<IUser> {
    const promise: Promise<IUser> = new Promise((resolve, reject) => {
      // Local change
      let user = this.authService.currentUserValue;
      user.favoriteJournals = user.favoriteJournals.filter((value) => {
        return value !== journalId;
      });
      this.authService.currentUser.next(user);

      // Sync with server
      this.isLoadingService.add();
      this.http
        .delete<IUser>(
          `${this.vidijoApiUrl}/users/me/favoriteJournals/${journalId}`,
          this.httpOptions
        )
        .subscribe(
          (user: IUser) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return resolve(user);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            // Reset local change
            let user = this.authService.currentUserValue;
            if (!user.favoriteJournals.includes(journalId)) {
              user.favoriteJournals.push(journalId);
            }
            this.authService.currentUser.next(user);

            return reject(err);
          }
        );
    });
    return promise;
  }

  public getReadingList(query: string = ""): Promise<IArticle[]> {
    const promise: Promise<IArticle[]> = new Promise((resolve, reject) => {
      this.isLoadingService.add();
      this.http
        .get<any>(
          `${this.vidijoApiUrl}/users/me/readingList${query}`,
          this.httpOptions
        )
        .subscribe(
          (readingListPage: any) => {
            this.isLoadingService.remove();
            return resolve(readingListPage.docs);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            return reject(err);
          }
        );
    });
    return promise;
  }

  public addArticleToReadingList(articleId: string): Promise<IUser> {
    const promise: Promise<IUser> = new Promise((resolve, reject) => {
      // Local change
      let user = this.authService.currentUserValue;
      if (!user.readingList.includes(articleId)) {
        user.readingList.push(articleId);
      }
      this.authService.currentUser.next(user);

      // Sync with server
      this.isLoadingService.add();
      this.http
        .post<IUser>(
          `${this.vidijoApiUrl}/users/me/readingList/${articleId}`,
          {},
          this.httpOptions
        )
        .subscribe(
          (user: IUser) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return resolve(user);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            // Reset local changes
            let user = this.authService.currentUserValue;
            user.readingList = user.readingList.filter((value) => {
              return value !== articleId;
            });
            this.authService.currentUser.next(user);
            return reject(err);
          }
        );
    });

    return promise;
  }

  public removeArticleFromReadingList(articleId: string): Promise<IUser> {
    const promise: Promise<IUser> = new Promise((resolve, reject) => {
      // Local changes
      let user = this.authService.currentUserValue;
      user.readingList = user.readingList.filter((value) => {
        return value !== articleId;
      });
      this.authService.currentUser.next(user);

      // Sync with server
      this.isLoadingService.add();
      this.http
        .delete<IUser>(
          `${this.vidijoApiUrl}/users/me/readingList/${articleId}`,
          this.httpOptions
        )
        .subscribe(
          (user: IUser) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return resolve(user);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            // Reset local changes
            let user = this.authService.currentUserValue;
            if (!user.readingList.includes(articleId)) {
              user.readingList.push(articleId);
            }
            this.authService.currentUser.next(user);

            return reject(err);
          }
        );
    });

    return promise;
  }
}

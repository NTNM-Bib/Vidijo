import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { environment } from "src/environments/environment";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { IJournal } from "src/app/journals/shared/journal.interface";
import { ICategory } from "src/app/journals/shared/category.interface";
import { IUser } from "src/app/users/shared/user.interface";
import { DatabaseService } from "src/app/core/database/database.service";
import { IsLoadingService } from "@service-work/is-loading";
import { tap } from "rxjs/operators";

@Injectable({
  providedIn: "root",
})
export class AdminService {
  private httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
    withCredentials: true,
  };
  private vidijoApiUrl = environment.vidijoApiUrl;

  public adminModeActive: BehaviorSubject<boolean>;

  constructor(
    private http: HttpClient,
    private databaseService: DatabaseService,
    private isLoadingService: IsLoadingService
  ) {
    this.adminModeActive = new BehaviorSubject<boolean>(false);
  }

  // Enter admin mode
  public enterAdminMode() {
    this.adminModeActive.next(true);
  }

  // Exit admin mode
  public exitAdminMode() {
    this.adminModeActive.next(false);
  }

  public searchJournalsInDOAJ(searchTerm: string) {
    this.isLoadingService.add();
    return this.http
      .get<{
        alreadyExistingJournals: IJournal[];
        availableJournals: IJournal[];
      }>(`${this.vidijoApiUrl}/search?term=${searchTerm}`, this.httpOptions)
      .pipe(
        tap((_) => {
          this.isLoadingService.remove();
        })
      );
  }

  // Add a new journal from DOAJ to Vidijo
  public addJournal(journal: IJournal): Promise<IJournal> {
    const promise: Promise<IJournal> = new Promise((resolve, reject) => {
      this.isLoadingService.add();

      this.http
        .post<IJournal>(
          `${this.vidijoApiUrl}/journals`,
          journal,
          this.httpOptions
        )
        .subscribe(
          (addedJournal: IJournal) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return resolve(addedJournal);
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

  uploadNewCover(journalId: string, coverFile: File) {
    const options = {
      headers: new HttpHeaders({}), // doesn't work when specifying Content-Type: multipart/form-data
      withCredentials: true,
    };

    const formData = new FormData();
    formData.append("cover", coverFile, coverFile.name);

    return this.http.put(
      `${this.vidijoApiUrl}/journals/${journalId}/cover`,
      formData,
      options
    );
  }

  // Remove the journal with given ID
  public deleteJournal(journalId: string): Promise<IJournal> {
    const promise: Promise<IJournal> = new Promise((resolve, reject) => {
      this.isLoadingService.add();

      this.http
        .delete<IJournal>(
          `${this.vidijoApiUrl}/journals/${journalId}`,
          this.httpOptions
        )
        .subscribe(
          (deletedJournal: IJournal) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return resolve(deletedJournal);
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

  // Add Category
  public addCategory(category: ICategory): Promise<ICategory> {
    const promise: Promise<ICategory> = new Promise((resolve, reject) => {
      this.isLoadingService.add();

      this.http
        .post<ICategory>(
          `${this.vidijoApiUrl}/categories`,
          category,
          this.httpOptions
        )
        .subscribe(
          (addedCategory: ICategory) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return resolve(addedCategory);
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

  // Edit category data
  public updateCategory(category: ICategory): Promise<ICategory> {
    const promise: Promise<ICategory> = new Promise((resolve, reject) => {
      this.isLoadingService.add();

      this.http
        .patch<ICategory>(
          `${this.vidijoApiUrl}/categories/${category._id}`,
          category,
          this.httpOptions
        )
        .subscribe(
          (updatedCategory: ICategory) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return resolve(updatedCategory);
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

  // Remove the category with given ID
  public deleteCategory(categoryId: string): Promise<ICategory> {
    const promise: Promise<ICategory> = new Promise((resolve, reject) => {
      this.isLoadingService.add();

      this.http
        .delete<ICategory>(
          `${this.vidijoApiUrl}/categories/${categoryId}`,
          this.httpOptions
        )
        .subscribe(
          (deletedCategory: ICategory) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return resolve(deletedCategory);
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

  // Get users
  public getUsers(query: string = ""): Promise<IUser[]> {
    const promise: Promise<IUser[]> = new Promise((resolve, reject) => {
      this.isLoadingService.add();

      this.http
        .get<IUser[]>(`${this.vidijoApiUrl}/users${query}`, this.httpOptions)
        .subscribe(
          (usersPage: any) => {
            this.isLoadingService.remove();
            return resolve(usersPage.docs);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            return reject(err);
          }
        );
    });

    return promise;
  }

  // Edit user data
  public updateUser(user: IUser): Promise<IUser> {
    const promise: Promise<IUser> = new Promise((resolve, reject) => {
      this.isLoadingService.add();

      this.http
        .patch<IUser>(
          `${this.vidijoApiUrl}/users/${user._id}`,
          user,
          this.httpOptions
        )
        .subscribe(
          (updatedUser: IUser) => {
            this.isLoadingService.remove();
            this.databaseService.reloadData();
            return resolve(updatedUser);
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

  /**
   * Get information about the uploaded .xlsx file
   * E.g. how many journals are on the list, how many will be added, ...
   * @param xlsxFile
   */
  public getXLSXInfo(xlsxFile: File) {
    const options = {
      headers: new HttpHeaders({}),
      withCredentials: true,
    };

    const body = new FormData();
    body.append("vidijodata", xlsxFile, xlsxFile.name);

    return this.http.post(
      `${this.vidijoApiUrl}/import/xlsx/info`,
      body,
      options
    );
  }

  /**
   * Upload the .xlsx file to the server
   * The server imports the journals in the background
   */
  public uploadXLSX(xlsxFile: File) {
    const options = {
      headers: new HttpHeaders({}),
      withCredentials: true,
    };

    const body = new FormData();
    body.append("vidijodata", xlsxFile, xlsxFile.name);

    return this.http
      .post(`${this.vidijoApiUrl}/import/xlsx`, body, options)
      .pipe(tap((uploaded) => console.log(uploaded)));
  }
}

export interface VidijoData {
  journals: IJournal[];
  categories: ICategory[];
}

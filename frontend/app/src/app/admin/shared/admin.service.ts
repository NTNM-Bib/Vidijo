import { Injectable } from "@angular/core";
import { BehaviorSubject } from "rxjs";
import { environment } from "src/environments/environment";
import { HttpHeaders, HttpClient } from "@angular/common/http";
import { IJournal } from "src/app/journals/shared/journal.interface";
import { ICategory } from "src/app/journals/shared/category.interface";
import { IUser } from "src/app/users/shared/user.interface";
import { DatabaseService } from "src/app/core/database/database.service";
import { IsLoadingService } from "@service-work/is-loading";
import * as XLSX from "xlsx";
//import * as Sharp from "sharp";

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

  public searchJournalsInDOAJ(searchTerm: string): Promise<IJournal[]> {
    const promise: Promise<IJournal[]> = new Promise((resolve, reject) => {
      this.isLoadingService.add();

      this.http
        .get<IJournal[]>(
          `${this.vidijoApiUrl}/search?term=${searchTerm}`,
          this.httpOptions
        )
        .subscribe(
          (journalsFromDOAJ: IJournal[]) => {
            this.isLoadingService.remove();
            return resolve(journalsFromDOAJ);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            return reject(err);
          }
        );
    });

    return promise;
  }

  // Add a new journal from DOAJ to Vidijo
  public addJournal(journal: IJournal): Promise<IJournal> {
    const promise: Promise<IJournal> = new Promise((resolve, reject) => {
      // Flush Cache
      this.databaseService.flushCache();

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
            return resolve(addedJournal);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            return reject(err);
          }
        );
    });

    return promise;
  }

  /*
  private resizeCover(coverFile: File) {
    coverFile.arrayBuffer().then((arrayBuffer) => {
      const buffer = Buffer.from(arrayBuffer);

      Sharp(buffer)
        .resize(200, 300)
        .toBuffer()
        .then((buffer) => {
          const s = `${buffer}`;
          console.log(s);
        });
    });

    return coverFile;
  }
  */

  uploadNewCover(journalId: string, coverFile: File) {
    const options = {
      headers: new HttpHeaders({}), // doesn't work when specifying Content-Type: multipart/form-data
      withCredentials: true,
    };

    //coverFile = this.resizeCover(coverFile);

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
      // Flush Cache
      this.databaseService.flushCache();

      this.isLoadingService.add();

      this.http
        .delete<IJournal>(
          `${this.vidijoApiUrl}/journals/${journalId}`,
          this.httpOptions
        )
        .subscribe(
          (deletedJournal: IJournal) => {
            this.isLoadingService.remove();
            return resolve(deletedJournal);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            return reject(err);
          }
        );
    });

    return promise;
  }

  // Add Category
  public addCategory(category: ICategory): Promise<ICategory> {
    const promise: Promise<ICategory> = new Promise((resolve, reject) => {
      // Flush Cache
      this.databaseService.flushCache();

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
            return resolve(addedCategory);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            return reject(err);
          }
        );
    });

    return promise;
  }

  // Edit category data
  public updateCategory(category: ICategory): Promise<ICategory> {
    const promise: Promise<ICategory> = new Promise((resolve, reject) => {
      // Flush Cache
      this.databaseService.flushCache();

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
            return resolve(updatedCategory);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            return reject(err);
          }
        );
    });

    return promise;
  }

  // Remove the category with given ID
  public deleteCategory(categoryId: string): Promise<ICategory> {
    const promise: Promise<ICategory> = new Promise((resolve, reject) => {
      // Flush Cache
      this.databaseService.flushCache();

      this.isLoadingService.add();

      this.http
        .delete<ICategory>(
          `${this.vidijoApiUrl}/categories/${categoryId}`,
          this.httpOptions
        )
        .subscribe(
          (deletedCategory: ICategory) => {
            this.isLoadingService.remove();
            return resolve(deletedCategory);
          },
          (err: Error) => {
            this.isLoadingService.remove();
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
      // Flush Cache
      this.databaseService.flushCache();

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
            return resolve(updatedUser);
          },
          (err: Error) => {
            this.isLoadingService.remove();
            return reject(err);
          }
        );
    });

    return promise;
  }

  // Import data from an .xlsx file
  async importXlsx(xlsxFile: File): Promise<any> {
    const data: VidijoData = await this.xlsxToJson(xlsxFile);
    return this.importData(data);
  }

  // Send data to the API to import journals and categories
  private async importData(data: VidijoData) {
    // FIXME: Fails if journal or category already exists -> Ignore already existing journals & categories instead and succeed
    const categoryPromises: Promise<ICategory>[] = data.categories.map(
      (category) => this.addCategory(category)
    );
    await Promise.all(categoryPromises).catch();

    const journalPromises: Promise<IJournal>[] = data.journals.map((journal) =>
      this.addJournal(journal)
    );
    await Promise.all(journalPromises).catch();
  }

  // Convert XLSX to JSON (VidijoData)
  async xlsxToJson(dataFile: File): Promise<VidijoData> {
    const promise: Promise<VidijoData> = new Promise((resolve, reject) => {
      const data = { journals: [], categories: [] } as VidijoData;

      const reader: FileReader = new FileReader();
      reader.onload = (e: any) => {
        const binaryString: string = e.target.result;
        const workbook: XLSX.WorkBook = XLSX.read(binaryString, {
          type: "binary",
        });
        const journals = <any[]>(
          XLSX.utils.sheet_to_json(workbook.Sheets["journals"])
        );
        for (let journal of journals) {
          data.journals.push(journal as IJournal);
        }
        return resolve(data);
      };

      reader.readAsBinaryString(dataFile);
    });

    return promise;
  }
}

export interface VidijoData {
  journals: IJournal[];
  categories: ICategory[];
}

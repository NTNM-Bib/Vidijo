import { Injectable } from '@angular/core';
import { Observable, Subject, throwError, BehaviorSubject } from 'rxjs';
import { IUser } from '../users/shared/user.interface';
import { HttpHeaders, HttpClient, HttpErrorResponse } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { map, catchError } from 'rxjs/operators';
import { DatabaseService } from '../core/database/database.service';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private httpOptions = {
    headers: new HttpHeaders({ "Content-Type": "application/json" }),
    withCredentials: true
  };
  private vidijoApiUrl = environment.vidijoApiUrl;

  public currentUser: BehaviorSubject<IUser>;


  constructor(
    private http: HttpClient,
    private databaseService: DatabaseService
  ) {
    this.currentUser = new BehaviorSubject<IUser>(null);

    this.getCurrentUserFromServer();
  }


  public get currentUserValue(): IUser {
    return this.currentUser.value;
  }


  public getCurrentUserFromServer() {
    this.http.get<IUser>(
      `${this.vidijoApiUrl}/users/me`,
      this.httpOptions
    ).subscribe((user: IUser) => {
      if (!user.username) {
        this.currentUser.next(null);
      }
      else {
        this.currentUser.next(user);
      }
    });
  }


  public login(user: IUser) {
    // Flush Cache
    this.databaseService.flushCache();

    this.http.post<IUser>(
      `${this.vidijoApiUrl}/auth/local/login`,
      user,
      this.httpOptions
    ).subscribe((user) => {
      this.currentUser.next(user);
    });
  }


  public logout() {
    // Flush Cache
    this.databaseService.flushCache();

    this.http.post<IUser>(
      `${this.vidijoApiUrl}/auth/local/logout`,
      {},
      this.httpOptions
    ).subscribe(() => {
      this.currentUser.next(null);
    });
  }


  public register(user: IUser): Observable<IUser> {
    return this.http.post<IUser>(
      `${this.vidijoApiUrl}/auth/local/register`,
      user,
      this.httpOptions
    )
      .pipe(
        catchError(this.handleError)
      );
  }


  public verify(token: string): Observable<IUser> {
    return this.http.get<IUser>(
      `${this.vidijoApiUrl}/auth/local/verify/${token}`,
      this.httpOptions
    );
  }


  // Error Handler
  private handleError(error: HttpErrorResponse) {
    // 4xx status codes
    if (error.status >= 400 && error.status < 500) {
      return throwError(error.error);
    }

    // 5xx status codes
    if (error.status >= 500) {
      return throwError(error.error);
    }

    // Unexpected errors
    console.error(`${error.status}: ${JSON.stringify(error.error)}`);
    return throwError("Unexpected error - please try again later");
  }

}

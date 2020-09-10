/**
 * =-- NavigationService --=
 * This service handles navigation throughout the app.
 * TODO: It automatically keeps track of the navigation history.
 * TODO: It automatically sets the correct route titles.
 */

import { Injectable } from "@angular/core";
import { Router, ActivatedRoute } from "@angular/router";
import { BreakpointObserver, Breakpoints } from "@angular/cdk/layout";

@Injectable({
  providedIn: "root",
})
export class NavigationService {
  constructor(
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private breakpointObserver: BreakpointObserver
  ) {}

  private insertDialogQueryParams(dialog: string, dialogData?: string) {
    const queryParams = {
      dialog: dialog,
      dialogData: dialogData ? dialogData : null,
    };

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams,
      queryParamsHandling: "merge",
    });
  }

  private get isMobile(): boolean {
    return this.breakpointObserver.isMatched(Breakpoints.Handset);
  }

  public closeDialog() {
    const queryParams = {
      dialog: null,
      dialogData: null,
    };

    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: queryParams,
      queryParamsHandling: "merge",
    });
  }

  public navigateToLogin() {
    if (this.isMobile) {
      this.router.navigate(["/login"]);
    } else {
      this.insertDialogQueryParams("login");
    }
  }

  public navigateToRegister() {
    if (this.isMobile) {
      this.router.navigate(["/register"]);
    } else {
      this.insertDialogQueryParams("register");
    }
  }

  public navigateToOnboarding() {
    if (this.isMobile) {
      this.router.navigate(["/onboarding"]);
    } else {
      this.insertDialogQueryParams("onboarding");
    }
  }

  public navigateToInfo() {
    if (this.isMobile) {
      this.router.navigate(["/info"]);
    } else {
      this.insertDialogQueryParams("info");
    }
  }

  public navigateToJournal(journalId: string) {
    this.router.navigate([`/j/${journalId}`]);
  }

  public navigateToArticle(articleId: string) {
    if (this.isMobile) {
      this.router.navigate([`/a/${articleId}`]);
    } else {
      this.insertDialogQueryParams("article", articleId);
    }
  }

  public navigateToReadingList() {
    /*
    if (this.isMobile) {
      this.router.navigate(["/readingList"]);
    }
    else {
      this.insertDialogQueryParams("readingList");
    }
    */
    this.router.navigate(["/readingList"]);
  }

  public navigateToMainPage() {
    const mainPage: "/journals" | "/discover" | "/home" = "/journals";
    this.router.navigate([mainPage]);
  }

  public navigateToHome() {
    this.router.navigate(["/home"]);
  }

  public navigateToDiscover() {
    this.router.navigate(["/discover"]);
  }

  public navigateToJournals(category?: string, sort?: string) {
    const queryParams = {
      category: category ? category : null,
      sort: sort ? sort : null,
    };

    this.router.navigate(["/journals"], {
      queryParams: queryParams,
    });
  }

  public navigateToCategories() {
    this.router.navigate(["/categories"]);
  }

  public navigateToSearch() {
    this.router.navigate(["/search"]);
  }

  // Admin: Add a journal
  public navigateToAddJournal(categoryId?: string) {
    if (this.isMobile) {
      this.router.navigate(["/admin/add-journal"]);
    } else {
      this.insertDialogQueryParams("add-journal", categoryId);
    }
  }

  // Admin: Edit a journal
  public navigateToEditJournal(journalId: string) {
    if (this.isMobile) {
      this.router.navigate([`/admin/edit-journal/${journalId}`]);
    } else {
      this.insertDialogQueryParams("edit-journal", journalId);
    }
  }

  // Admin: Add a category
  public navigateToAddCategory() {
    if (this.isMobile) {
      this.router.navigate(["/admin/add-category"]);
    } else {
      this.insertDialogQueryParams("add-category");
    }
  }

  // Admin: Edit a category
  public navigateToEditCategory(categoryId: string) {
    if (this.isMobile) {
      this.router.navigate([`/admin/edit-category/${categoryId}`]);
    } else {
      this.insertDialogQueryParams("edit-category", categoryId);
    }
  }

  // Admin: Edit a user
  public navigateToEditUser(userId: string) {
    if (this.isMobile) {
      this.router.navigate([`/admin/edit-user/${userId}`]);
    } else {
      this.insertDialogQueryParams("edit-user", userId);
    }
  }

  // Go to the password reset request page
  // The user must enter his username to receive an email with a reset token
  public navigateToPasswordResetRequest() {
    if (this.isMobile) {
      this.router.navigate(["/account/request-password-reset"]);
    } else {
      this.insertDialogQueryParams("request-password-reset");
    }
  }
}

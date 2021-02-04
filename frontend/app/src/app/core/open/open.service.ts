/**
 * =-- OpenService --=
 * This service handles opening and closing of dialogs.
 * It automatically checks for query parameters that should open a dialog
 *
 * Query parameters:
 * - dialog: string     // specify the component that should be opened in the dialog
 * - dialogData?: string // data given to the component (optional)
 */

import { Injectable } from "@angular/core";
import { IArticle } from "src/app/journals/shared/article.interface";
import { ArticleComponent } from "src/app/journals/pages/article/article.component";
import { MatDialog, MatDialogRef } from "@angular/material/dialog";
import { ComponentDialogComponent } from "./component-dialog/component-dialog.component";
import { ActivatedRoute } from "@angular/router";
import { InfoComponent } from "src/app/info/pages/info/info.component";
import { LoginComponent } from "src/app/users/pages/login/login.component";
import { RegisterComponent } from "src/app/users/pages/register/register.component";
import { OnboardingComponent } from "src/app/info/pages/onboarding/onboarding.component";
import { ReadingListComponent } from "src/app/users/pages/reading-list/reading-list.component";
import { Overlay } from "@angular/cdk/overlay";
import { JournalService } from "src/app/journals/shared/journal.service";
import { AddJournalComponent } from "src/app/admin/pages/add-journal/add-journal.component";
import { EditJournalComponent } from "src/app/admin/pages/edit-journal/edit-journal.component";
import { IJournal } from "src/app/journals/shared/journal.interface";
import { ICategory } from "src/app/journals/shared/category.interface";
import { AddCategoryComponent } from "src/app/admin/pages/add-category/add-category.component";
import { EditCategoryComponent } from "src/app/admin/pages/edit-category/edit-category.component";
import { EditUserComponent } from "src/app/admin/pages/edit-user/edit-user.component";
import { IUser } from "src/app/users/shared/user.interface";
import { RequestPasswordResetComponent } from "src/app/users/pages/request-password-reset/request-password-reset.component";
import { ResetPasswordComponent } from "src/app/users/pages/reset-password/reset-password.component";
import { AddJournalUploadedListComponent } from "src/app/admin/components/add-journal-uploaded-list/add-journal-uploaded-list.component";

@Injectable({
  providedIn: "root",
})
export class OpenService {
  private componentDialogRef: MatDialogRef<ComponentDialogComponent>;

  constructor(
    private componentDialog: MatDialog,
    private overlay: Overlay,
    private activatedRoute: ActivatedRoute,
    private journalService: JournalService
  ) {
    // Check if dialog must be opened on current route
    this.activatedRoute.queryParams.subscribe((params) => {
      this.closeCurrentDialog();

      switch (params.dialog) {
        case "login":
          this.openLoginDialog();
          break;
        case "register":
          this.openRegisterDialog();
          break;
        case "info":
          this.openInfoDialog();
          break;
        case "readingList":
          this.openReadingListDialog();
          break;
        case "onboarding":
          this.openOnboardingDialog();
          break;
        case "article":
          this.openArticleDialog(params.dialogData);
          break;
        case "add-journal":
          this.openAddJournalDialog(params.dialogData);
          break;
        case "edit-journal":
          this.openEditJournalDialog(params.dialogData);
          break;
        case "add-category":
          this.openAddCategoryDialog();
          break;
        case "edit-category":
          this.openEditCategoryDialog(params.dialogData);
          break;
        case "edit-user":
          this.openEditUserDialog(params.dialogData);
          break;
        case "request-password-reset":
          this.openRequestPasswordResetDialog();
          break;
        case "add-journals-list":
          this.openAddJournalUploadedListDialog();
          break;
      }
    });
  }

  // Open an article (as a page on mobile, as a dialog on desktop)
  private openArticleDialog(article: IArticle | string) {
    this.closeCurrentDialog();

    if (typeof article === "string") {
      this.journalService.getArticle(article).subscribe((art: IArticle) => {
        this.componentDialogRef = this.componentDialog.open(
          ComponentDialogComponent,
          {
            autoFocus: false,
            disableClose: true,
            panelClass: "g_dialog-lg",
            backdropClass: "g_dialog-backdrop",
            data: {
              component: ArticleComponent,
              inputs: {
                article: art, // Input for ArticleComponent
              },
            },
          }
        );
      });
    } else {
      this.componentDialogRef = this.componentDialog.open(
        ComponentDialogComponent,
        {
          autoFocus: false,
          disableClose: true,
          panelClass: "g_dialog-lg",
          backdropClass: "g_dialog-backdrop",
          data: {
            component: ArticleComponent,
            inputs: {
              article: article, // Input for ArticleComponent
            },
          },
        }
      );
    }
  }

  // Open information page
  private openInfoDialog() {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-lg",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: InfoComponent,
        },
      }
    );
  }

  // Open login dialog
  private openLoginDialog() {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-sm",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: LoginComponent,
        },
      }
    );
  }

  // Open register dialog
  private openRegisterDialog() {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-sm",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: RegisterComponent,
        },
      }
    );
  }

  // Open onboarding dialog
  private openOnboardingDialog() {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-sm",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: OnboardingComponent,
        },
      }
    );
  }

  // Open reading list
  private openReadingListDialog() {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-lg",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: ReadingListComponent,
        },
      }
    );
  }

  // Open admin: add journal dialog
  private openAddJournalDialog(categoryId?: string) {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-lg",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: AddJournalComponent,
          inputs: {
            category: { _id: categoryId } as ICategory, // Input for AddJournalComponent
          },
        },
      }
    );
  }

  // Open admin: edit journal dialog
  private openEditJournalDialog(journalId: string) {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-lg",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: EditJournalComponent,
          inputs: {
            journal: { _id: journalId } as IJournal, // Input for EditJournalComponent
          },
        },
      }
    );
  }

  // Open admin: add category dialog
  private openAddCategoryDialog() {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-lg",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: AddCategoryComponent,
        },
      }
    );
  }

  // Open admin: edit category dialog
  private openEditCategoryDialog(categoryId?: string) {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-lg",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: EditCategoryComponent,
          inputs: {
            category: { _id: categoryId } as ICategory, // Input for EditCategoryComponent
          },
        },
      }
    );
  }

  // Open admin: edit user dialog
  private openEditUserDialog(userId?: string) {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-lg",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: EditUserComponent,
          inputs: {
            user: { _id: userId } as IUser, // Input for EditUserComponent
          },
        },
      }
    );
  }

  private openRequestPasswordResetDialog() {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-sm",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: RequestPasswordResetComponent,
        },
      }
    );
  }

  private openAddJournalUploadedListDialog() {
    this.closeCurrentDialog();

    this.componentDialogRef = this.componentDialog.open(
      ComponentDialogComponent,
      {
        autoFocus: false,
        disableClose: true,
        panelClass: "g_dialog-sm",
        backdropClass: "g_dialog-backdrop",
        data: {
          component: AddJournalUploadedListComponent,
        },
      }
    );
  }

  // Close the currently opened dialog
  public closeCurrentDialog() {
    if (this.componentDialogRef) {
      this.componentDialogRef.close();
    }
  }
}

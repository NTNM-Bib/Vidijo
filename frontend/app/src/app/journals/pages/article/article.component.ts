import { Component, OnInit, Input } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { IArticle } from "../../shared/article.interface";
import { JournalService } from "src/app/journals/shared/journal.service";
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from "@angular/cdk/layout";
import { UserService } from "src/app/users/shared/user.service";
import { IUser } from "src/app/users/shared/user.interface";
import { AuthService } from "src/app/auth/auth.service";
import { AlertService } from "src/app/core/alert/alert.service";
import { Title } from "@angular/platform-browser";
import { IsLoadingService } from "@service-work/is-loading";

@Component({
  selector: "app-article",
  templateUrl: "./article.component.html",
  styleUrls: ["./article.component.scss"],
})
export class ArticleComponent implements OnInit {
  @Input() article: IArticle;

  isMobile: boolean = false;
  isInReadingList: boolean = false;
  showButtonRowElevation: boolean;
  isLoggedIn: boolean = false;
  user: IUser;

  constructor(
    private route: ActivatedRoute,
    private journalService: JournalService,
    private userService: UserService,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private alertService: AlertService,
    private titleService: Title,
    private isLoadingService: IsLoadingService
  ) {}

  async ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    if (!this.article) {
      this.route.params.subscribe(async (params) => {
        await this.getArticle(params.id);

        // User
        this.authService.currentUser.subscribe((user: IUser) => {
          this.user = user;
          this.isLoggedIn = user !== null;
          this.isInReadingList = this.userService.isInReadingList(
            this.article._id
          );
        });

        // Set the title to ${article.title} - Vidijo
        this.titleService.setTitle(`${this.article.title} - Vidijo`);
      });
    } else {
      await this.getArticle(this.article._id);

      // User
      this.authService.currentUser.subscribe((user: IUser) => {
        this.user = user;
        this.isLoggedIn = user !== null;
        this.isInReadingList = this.userService.isInReadingList(
          this.article._id
        );
      });

      // Set the title to ${article.title} - Vidijo
      this.titleService.setTitle(`${this.article.title} - Vidijo`);
    }
  }

  private async getArticle(id: string): Promise<void> {
    const promise: Promise<void> = new Promise((resolve, reject) => {
      this.isLoadingService.add();
      this.journalService.getArticle(id).subscribe((article: IArticle) => {
        this.article = article;
        this.isLoadingService.remove();
        return resolve();
      });
    });

    return promise;
  }

  // Add this article to the Reading List
  addArticleToReadingList() {
    this.userService
      .addArticleToReadingList(this.article._id)
      .then(() => {
        this.alertService.showSnackbarAlert(
          "Added this article to your reading list",
          "Okay",
          () => {}
        );
      })
      .catch((err: Error) => {
        this.alertService.showSnackbarAlert(
          "Cannot add this article to your reading list",
          "Retry",
          () => {
            this.addArticleToReadingList();
          },
          5000,
          true
        );
      });
  }

  // Remove Article from Reading List
  removeArticleFromReadingList() {
    this.userService
      .removeArticleFromReadingList(this.article._id)
      .then(() => {
        this.alertService.showSnackbarAlert(
          "Removed this article from your reading list",
          "Okay",
          () => {}
        );
      })
      .catch((err: Error) => {
        this.alertService.showSnackbarAlert(
          "Cannot remove this article from your reading list",
          "Retry",
          () => {
            this.removeArticleFromReadingList();
          },
          5000,
          true
        );
      });
  }
}

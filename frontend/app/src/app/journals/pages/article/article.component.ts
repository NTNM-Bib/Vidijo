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

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.getArticleAndUser();
  }

  private getArticleAndUser() {
    const id = this.article?._id ?? this.route.snapshot.params.id;
    const query = `?_id=${id}&populate=publishedIn&populateSelect=title`;
    this.journalService.getArticles(query).subscribe((articles) => {
      this.article = articles[0] ?? this.article;
      this.titleService.setTitle(`${this.article.title} - Vidijo`);

      this.authService.currentUser.subscribe((user: IUser) => {
        this.user = user;
        this.isLoggedIn = user !== null;
        this.isInReadingList = this.userService.isInReadingList(
          this.article._id
        );
      });
    });
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

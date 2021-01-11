import { Component, OnInit } from "@angular/core";
import { UserService } from "../../shared/user.service";
import { IArticle } from "src/app/journals/shared/article.interface";
import { AlertService } from "src/app/core/alert/alert.service";
import { NavigationService } from "src/app/core/navigation/navigation.service";
import { AuthService } from "src/app/auth/auth.service";
import { IUser } from "../../shared/user.interface";

@Component({
  selector: "app-reading-list",
  templateUrl: "./reading-list.component.html",
  styleUrls: ["./reading-list.component.scss"],
})
export class ReadingListComponent implements OnInit {
  readingList: IArticle[] = [];

  constructor(
    private userService: UserService,
    private authService: AuthService,
    private navigationService: NavigationService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.authService.currentUser.subscribe(async (user: IUser) => {
      this.getReadingListArticles();
    });
  }

  // Get Reading List
  private getReadingListArticles() {
    this.userService
      .getReadingList(
        `?populate=publishedIn&populateSelect=title useGeneratedCover`
      )
      .then((readingList: IArticle[]) => {
        this.readingList = readingList;
      })
      .catch(() => {
        this.readingList = [];
        this.alertService.showSnackbarAlert(
          "Cannot load your reading list",
          "Retry",
          () => {
            this.getReadingListArticles();
          },
          5000,
          true
        );
      });
  }

  public openArticle(article: IArticle) {
    this.navigationService.navigateToArticle(article._id);
  }
}

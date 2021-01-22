import {
  Component,
  OnInit,
  Input,
  HostListener,
  Inject,
  LOCALE_ID,
} from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { FormControl } from "@angular/forms";
import { Observable } from "rxjs";
import { map, startWith } from "rxjs/operators";
import { JournalService } from "../../shared/journal.service";
import { IJournal } from "../../shared/journal.interface";
import { IArticle } from "../../shared/article.interface";
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from "@angular/cdk/layout";
import { UserService } from "src/app/users/shared/user.service";
import { IUser } from "src/app/users/shared/user.interface";
import { AuthService } from "src/app/auth/auth.service";
import { AlertService } from "src/app/core/alert/alert.service";
import { Title } from "@angular/platform-browser";
import { IsLoadingService } from "@service-work/is-loading";
import { AdminService } from "src/app/admin/shared/admin.service";
import { NavigationService } from "src/app/core/navigation/navigation.service";
import { formatDate } from "@angular/common";

@Component({
  selector: "app-journal",
  templateUrl: "./journal.component.html",
  styleUrls: ["./journal.component.scss"],
})
export class JournalComponent implements OnInit {
  @Input() journal: IJournal;

  isMobile: boolean = false;
  articleSearchFormControl = new FormControl();

  // Filtered by search term.
  filteredArticles: Observable<IArticle[]>;

  // Articles grouped by publication date (month).
  articlesByMonth: Map<string, IArticle[]> = new Map<string, IArticle[]>();

  // User
  user: IUser;
  isLoggedIn: boolean;
  isFavorite: boolean;

  // Pagination
  currentlyLoadingArticles: boolean = false;
  articlesPage: number = 1;
  articlesPageLimit: number = 25;
  loadedAllArticles: boolean = false;

  adminModeActive$ = this.adminService.adminModeActive$;

  constructor(
    private route: ActivatedRoute,
    private journalService: JournalService,
    private userService: UserService,
    private authService: AuthService,
    private breakpointObserver: BreakpointObserver,
    private titleService: Title,
    private isLoadingService: IsLoadingService,
    private adminService: AdminService,
    private navigationService: NavigationService,
    private alertService: AlertService,
    @Inject(LOCALE_ID) private locale: string
  ) {}

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    // Get journal from service
    this.route.params.subscribe(async (params) => {
      await this.getJournal(params.id);

      // Set the title to ${journal.title} - Vidijo
      this.titleService.setTitle(`${this.journal.title} - Vidijo`);

      this.authService.currentUser.subscribe((user: IUser) => {
        if (!this.journal) {
          return;
        }

        this.user = user;
        this.isLoggedIn = this.user !== null;
        this.isFavorite =
          this.isLoggedIn &&
          this.user.favoriteJournals.includes(this.journal._id);
      });
    });
  }

  async getJournal(id: string): Promise<void> {
    const promise: Promise<void> = new Promise((resolve, reject) => {
      this.isLoadingService.add();

      this.journalService.getJournal(id).subscribe(async (journal) => {
        this.journal = journal;
        this.journal.articles = [];
        await this.getArticlesPaginated();

        this.isLoadingService.remove();
        return resolve();
      });
    });

    return promise;
  }

  getArticlesPaginated(): Promise<void> {
    const promise: Promise<void> = new Promise<void>((resolve, reject) => {
      this.isLoadingService.add();

      this.currentlyLoadingArticles = true;
      this.journalService
        .getArticles(
          `?publishedIn=${this.journal._id}&select=title authors pubdate abstract&sort=-pubdate&limit=${this.articlesPageLimit}&page=${this.articlesPage}`
        )
        .subscribe((articles: any) => {
          if (articles.docs.length < 1) {
            this.loadedAllArticles = true;
          }

          this.journal.articles = this.journal.articles.concat(articles.docs);
          // Sanitize publication dates.
          for (const article of this.journal.articles) {
            let timestamp: number;
            if (article.pubdate) {
              timestamp = Date.parse(article.pubdate.toString());
            } else {
              timestamp = 0;
            }

            if (!isNaN(timestamp)) {
              article.pubdate = new Date(timestamp);
            } else {
              article.pubdate = null;
            }
          }

          // Group articles by publication date.
          this.articlesByMonth = this.groupArticlesByMonth(
            this.journal.articles
          );

          // Filter articles.
          this.filteredArticles = this.articleSearchFormControl.valueChanges.pipe(
            startWith(""),
            map((value) => this._filter(value))
          );

          this.isLoadingService.remove();
          this.currentlyLoadingArticles = false;
          return resolve();
        });
    });

    return promise;
  }

  private groupArticlesByMonth(articles: IArticle[]): Map<string, IArticle[]> {
    const monthNames: string[] = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const result: Map<string, IArticle[]> = new Map<string, IArticle[]>();

    for (const article of articles) {
      if (article.pubdate) {
        const simplifiedDate: Date = new Date(
          article.pubdate.getFullYear(),
          article.pubdate.getMonth()
        );
        const simplifiedDateString = `${
          monthNames[simplifiedDate.getMonth()]
        } ${simplifiedDate.getFullYear()}`;

        let articlesOfThisDate: IArticle[] = result.get(simplifiedDateString);
        if (!articlesOfThisDate) {
          articlesOfThisDate = [article];
        } else {
          articlesOfThisDate.push(article);
        }

        result.set(simplifiedDateString, articlesOfThisDate);
      }
    }

    return result;
  }

  get articleByMonthKeys() {
    return Array.from(this.articlesByMonth.keys());
  }

  private _filter(value: string): IArticle[] {
    const filterValue = value.toLowerCase();
    return this.journal.articles.filter((article) =>
      article.title.toLowerCase().includes(filterValue)
    );
  }

  addToFavorites() {
    this.userService
      .addFavoriteJournal(this.journal._id)
      .then(() => {
        this.alertService.showSnackbarAlert(
          "Added this journal to your favorites",
          "Okay",
          () => {}
        );
      })
      .catch(() => {
        this.alertService.showSnackbarAlert(
          `Cannot add this journal to your favorites`,
          `Retry`,
          () => {
            return this.addToFavorites();
          },
          5000,
          true
        );
      });
  }

  removeFromFavorites() {
    this.userService
      .removeFavoriteJournal(this.journal._id)
      .then(() => {
        this.alertService.showSnackbarAlert(
          "Removed this journal from your favorites",
          "Okay",
          () => {}
        );
      })
      .catch(() => {
        this.alertService.showSnackbarAlert(
          "Cannot remove this journal from your favorites",
          "Retry",
          () => {
            this.removeFromFavorites();
          },
          5000,
          true
        );
      });
  }

  editJournal() {
    this.navigationService.navigateToEditJournal(this.journal._id);
  }

  // Load next page of articles when scrolled to bottom
  @HostListener("window:scroll")
  async getNextArticlePage() {
    if (
      !this.journal ||
      this.loadedAllArticles ||
      this.currentlyLoadingArticles
    ) {
      return;
    }

    if (
      window.scrollY + window.innerHeight >
      document.documentElement.scrollHeight - 0.3 * window.innerHeight
    ) {
      this.articlesPage++;
      await this.getArticlesPaginated();
    }
  }

  showMoreDetailsDialog() {
    this.alertService.showDialogAlert(
      "Details",
      `Cover retrieved from ${this.journal.coverUrl} on ${formatDate(
        this.journal.coverDate,
        "yyyy-MM-dd",
        this.locale
      )}`,
      "Okay",
      () => {}
    );
  }
}

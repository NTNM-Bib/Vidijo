import { Component, OnInit, OnChanges } from '@angular/core';
import { UserService } from '../../shared/user.service';
import { IUser } from '../../shared/user.interface';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { IJournal } from 'src/app/journals/shared/journal.interface';
import { IArticle } from 'src/app/journals/shared/article.interface';
import { JournalService } from 'src/app/journals/shared/journal.service';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertService } from 'src/app/core/alert/alert.service';
import { Router, ActivatedRoute } from '@angular/router';
import { NavigationService } from 'src/app/core/navigation/navigation.service';
import { IsLoadingService } from '@service-work/is-loading';
import { IHomePage } from 'src/app/journals/shared/home-page.interface';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss']
})
export class HomeComponent implements OnInit {

  isMobile: boolean = false;
  user: IUser = {} as IUser;
  finishedLoading: boolean = false;

  // Newest Articles (of favorite Journals)
  favoriteJournalsNewestArticles: IJournal[] = [];
  titleInfoText: string = "";

  // Reading List
  readingListArticles: IArticle[] = [];
  numDisplayedReadingListArticles: number = 5;
  readingListEditMode: boolean = false;

  // Favorites
  favoriteJournals: IJournal[] = [];

  numJournalsToDisplay: number = 0;


  constructor(
    private breakpointObserver: BreakpointObserver,
    private authService: AuthService,
    private journalService: JournalService,
    private router: Router,
    private navigationService: NavigationService,
    private activatedRoute: ActivatedRoute
  ) { }


  async ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.observeScreenWidth();

    // User
    this.activatedRoute.queryParams.subscribe(async () => {
      this.authService.currentUser.subscribe(async (user: IUser) => {
        this.user = user;

        await this.getHomePage();

        this.finishedLoading = true;

        this.setTitleInfoText();
      });
    });
  }


  async getHomePage() {
    const homePage: IHomePage = await this.journalService.getHomePage().catch();

    this.favoriteJournalsNewestArticles = homePage.recentlyUpdatedFavoriteJournals ? homePage.recentlyUpdatedFavoriteJournals : [];
    this.readingListArticles = homePage.lastReadingListArticles ? homePage.lastReadingListArticles : [];
    this.favoriteJournals = homePage.favoriteJournals ? homePage.favoriteJournals : [];
  }


  get greetingDependingOnTime(): string {
    const hours: number = (new Date().getHours() + 1) % 24;

    if (5 < hours && hours <= 12) {
      return "Good morning";
    }
    else if (12 < hours && hours <= 18) {
      return "Good afternoon";
    }
    else if (18 < hours && hours <= 22) {
      return "Good evening";
    }
    else {
      return "Hello";
    }
  }


  get isLoggedIn(): boolean {
    return this.user !== null;
  }

  get showOnboarding(): boolean {
    return this.isLoggedIn ? this.user.favoriteJournals.length < 1 && this.user.readingList.length < 1 : false;
  }


  private setTitleInfoText() {
    if (this.showOnboarding) {
      this.titleInfoText = "Welcome to your home page! Let's see how to get started...";
      return;
    }

    if (this.favoriteJournals.length === 0) {
      this.titleInfoText = "Add journals to your favorites if you want to see their newly published articles on this page";
      return;
    }

    switch (this.favoriteJournalsNewestArticles.length) {
      case 0:
        this.titleInfoText = "Currently there are no new articles available for you";
        break;
      case 1:
        this.titleInfoText = "One of your favorite journals has recently been updated";
        break;
      default:
        this.titleInfoText = "Some of your favorite journals have recently been updated";
        break;
    }
  }


  public openArticle(article: IArticle) {
    this.navigationService.navigateToArticle(article._id);
  }


  public openRegister() {
    this.navigationService.navigateToRegister();
  }


  public openOnboarding() {
    this.navigationService.navigateToOnboarding();
  }


  public showAllFavoritesNewestArticles() {
    const queryParams: any = {
      category: "favorites",
      sort: "-latestPubdate"
    };

    this.router.navigate(
      ["/journals"],
      {
        queryParams: queryParams,
        queryParamsHandling: "merge"
      }
    );
  }


  public showAllFavorites() {
    const queryParams: any = {
      category: "favorites",
      sort: "+title"
    };

    this.router.navigate(
      ["/journals"],
      {
        queryParams: queryParams,
        queryParamsHandling: "merge"
      }
    );
  }


  public openReadingList() {
    this.navigationService.navigateToReadingList();
  }


  // Observe screen width to determine number of horizontally displayed journals
  // TODO: REMOVE THIS WHEN HORIZONTAL SCROLLING CONTAINER IS IMPLEMENTED FOR DESKTOP
  private observeScreenWidth() {
    this.breakpointObserver.observe(["(min-width: 1800px)"]).subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.numJournalsToDisplay = 6;
      }
    });

    this.breakpointObserver.observe(["(min-width: 1400px) and (max-width: 1799px)"]).subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.numJournalsToDisplay = 5;
      }
    });

    this.breakpointObserver.observe(["(min-width: 1000px) and (max-width: 1399px)"]).subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.numJournalsToDisplay = 4;
      }
    });

    this.breakpointObserver.observe(["(min-width: 800px) and (max-width: 999px)"]).subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.numJournalsToDisplay = 3;
      }
    });

    this.breakpointObserver.observe(["(min-width: 600px) and (max-width: 799px)"]).subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.numJournalsToDisplay = 2;
      }
    });

    this.breakpointObserver.observe(["(min-width: 300px) and (max-width: 599px)"]).subscribe((state: BreakpointState) => {
      if (state.matches) {
        this.numJournalsToDisplay = Infinity;
      }
    });
  }

}

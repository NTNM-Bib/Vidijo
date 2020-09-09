import { Component, OnInit, AfterViewInit, HostListener } from "@angular/core";
import { IJournal } from "../../shared/journal.interface";
import { JournalService } from "../../shared/journal.service";
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
  MediaMatcher
} from "@angular/cdk/layout";
import { ICategory } from "../../shared/category.interface";
import { IsLoadingService } from "@service-work/is-loading";
import { ActivatedRoute } from '@angular/router';
import { IDiscoverPage } from '../../shared/discover-page.interface';


@Component({
  selector: "app-discover",
  templateUrl: "./discover.component.html",
  styleUrls: ["./discover.component.scss"]
})
export class DiscoverComponent implements OnInit {
  isMobile: boolean = false;

  recentlyUpdatedJournals: IJournal[] = [];
  categories: ICategory[] = [];
  recentlyAddedJournals: IJournal[] = [];
  mostViewedJournals: IJournal[] = [];

  numJournalsToDisplay: number = 0;


  constructor(
    private journalService: JournalService,
    private breakpointObserver: BreakpointObserver,
    private activatedRoute: ActivatedRoute
  ) { }


  async ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.observeScreenWidth();

    this.activatedRoute.queryParams.subscribe(async () => {
      await this.getDiscoverPage();
    });
  }


  async getDiscoverPage() {
    const discoverPage: IDiscoverPage = await this.journalService.getDiscoverPage().catch();

    this.recentlyUpdatedJournals = discoverPage.recentlyUpdatedJournals;
    this.categories = discoverPage.topCategories;
    this.recentlyAddedJournals = discoverPage.recentlyAddedJournals;
    this.mostViewedJournals = discoverPage.mostViewedJournals;
  }


  private get discoverPageNotLoaded(): boolean {
    return (this.recentlyUpdatedJournals.length < 1) && (this.recentlyAddedJournals.length < 1) && (this.categories.length < 1) && (this.mostViewedJournals.length < 1);
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

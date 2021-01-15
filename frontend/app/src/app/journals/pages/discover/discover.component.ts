import { Component, OnInit, AfterViewInit, HostListener } from "@angular/core";
import { IJournal } from "../../shared/journal.interface";
import { JournalService } from "../../shared/journal.service";
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
  MediaMatcher,
} from "@angular/cdk/layout";
import { ICategory } from "../../shared/category.interface";
import { IsLoadingService } from "@service-work/is-loading";
import { ActivatedRoute } from "@angular/router";
import { IDiscoverPage } from "../../shared/discover-page.interface";
import { Observable } from "rxjs";
import { DatabaseService } from "src/app/core/database/database.service";

@Component({
  selector: "app-discover",
  templateUrl: "./discover.component.html",
  styleUrls: ["./discover.component.scss"],
})
export class DiscoverComponent implements OnInit {
  isMobile: boolean = false;
  data$: Observable<IDiscoverPage>;

  numJournalsToDisplay: number = 0;

  constructor(
    private databaseService: DatabaseService,
    private breakpointObserver: BreakpointObserver
  ) {}

  async ngOnInit() {
    this.data$ = this.databaseService.discoverPageData$;

    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.observeScreenWidth();
  }

  // Observe screen width to determine number of horizontally displayed journals
  private observeScreenWidth() {
    this.breakpointObserver
      .observe(["(min-width: 1800px)"])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.numJournalsToDisplay = 6;
        }
      });

    this.breakpointObserver
      .observe(["(min-width: 1400px) and (max-width: 1799px)"])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.numJournalsToDisplay = 5;
        }
      });

    this.breakpointObserver
      .observe(["(min-width: 1000px) and (max-width: 1399px)"])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.numJournalsToDisplay = 4;
        }
      });

    this.breakpointObserver
      .observe(["(min-width: 800px) and (max-width: 999px)"])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.numJournalsToDisplay = 3;
        }
      });

    this.breakpointObserver
      .observe(["(min-width: 600px) and (max-width: 799px)"])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.numJournalsToDisplay = 2;
        }
      });

    this.breakpointObserver
      .observe(["(min-width: 300px) and (max-width: 599px)"])
      .subscribe((state: BreakpointState) => {
        if (state.matches) {
          this.numJournalsToDisplay = Infinity;
        }
      });
  }
}

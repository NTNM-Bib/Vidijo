import { Component, OnInit, HostListener } from "@angular/core";
import * as _ from "lodash";
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from "@angular/cdk/layout";
import { ActivatedRoute, Router } from "@angular/router";
import { ICategory } from "../../shared/category.interface";
import { Title } from "@angular/platform-browser";
import { AdminService } from "src/app/admin/shared/admin.service";
import { IJournalsPage } from "../../shared/journals-page.interface";
import { Observable } from "rxjs";
import { DatabaseService } from "src/app/core/database/database.service";
import { JournalService } from "../../shared/journal.service";

@Component({
  selector: "app-all",
  templateUrl: "./all.component.html",
  styleUrls: ["./all.component.scss"],
})
export class AllComponent implements OnInit {
  isMobile: boolean;
  adminModeActive$: Observable<boolean>;

  data: IJournalsPage;

  // Sort
  sort: "+title" | "-latestPubdate" | "-added" | "-views" = "+title";
  sortButtons: any[] = [
    {
      title: "A - Z",
      sort: "+title",
    },
    {
      title: "Newest articles",
      sort: "-latestPubdate",
    },
    {
      title: "Recently added",
      sort: "-added",
    },
    {
      title: "Most viewed",
      sort: "-views",
    },
  ];

  // Pagination
  currentlyLoadingJournals: boolean = false;
  currentPage: number = 1;
  journalsPageLimit: number = 20;
  loadedAllJournals: boolean = false;

  sortParam: string = "";
  categoryParam: string = "";

  constructor(
    private breakpointObserver: BreakpointObserver,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private adminService: AdminService,
    private databaseService: DatabaseService,
    private journalService: JournalService
  ) {}

  async ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.adminModeActive$ = this.adminService.adminModeActive$;

    this.databaseService.journalsPageData$.subscribe((data) => {
      this.resetPagination();
      this.data = data;
      this.titleService.setTitle(`${data?.category?.title} - Vidijo`);
    });

    // Check for route changes
    this.activatedRoute.queryParams.subscribe(async (params) => {
      this.sortParam = params.sort;
      this.categoryParam = params.category;

      this.databaseService.reloadJournalsPageIfParamsChanged(
        this.categoryParam,
        this.sortParam
      );
    });
  }

  getTitle(data: IJournalsPage): string {
    if (!data) return "";

    switch (data.category._id) {
      case "all":
        return "All Journals";
      case "favorites":
        return "My Favorites";
      default:
        return data.category.title;
    }
  }

  onCategoryButtonClick(category: ICategory) {
    let categoryParam: string;

    switch (category._id) {
      case "all":
      case "": {
        categoryParam = undefined;
        break;
      }

      case "favorites": {
        categoryParam = "favorites";
        break;
      }

      default: {
        categoryParam = category._id;
        break;
      }
    }

    // Navigate
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        category: categoryParam,
      },
      queryParamsHandling: "merge",
    });
  }

  onSortButtonClick(sortButton: any) {
    this.router.navigate([], {
      relativeTo: this.activatedRoute,
      queryParams: {
        sort: sortButton.sort,
      },
      queryParamsHandling: "merge",
    });
  }

  private resetPagination() {
    this.loadedAllJournals = false;
    this.currentPage = 1;
  }

  getJournalsPaginated(): Promise<void> {
    const promise: Promise<void> = new Promise<void>((resolve, reject) => {
      this.currentlyLoadingJournals = true;
      this.currentPage++;
      this.journalService
        .getJournals(
          `?select=title useGeneratedCover&sort=${
            this.sortParam ? this.sortParam : "+title"
          }&categories=${this.categoryParam ? this.categoryParam : ""}&limit=${
            this.journalsPageLimit
          }&page=${this.currentPage}`
        )
        .subscribe((journals: any) => {
          if (journals.docs.length < 1) {
            this.loadedAllJournals = true;
          }

          this.data.journals = this.data.journals.concat(journals.docs);

          this.currentlyLoadingJournals = false;
          return resolve();
        });
    });

    return promise;
  }

  // Load next page of articles when scrolled to bottom
  @HostListener("window:scroll")
  async getNextArticlePage() {
    if (this.loadedAllJournals || this.currentlyLoadingJournals) {
      return;
    }

    if (
      window.scrollY + window.innerHeight >
      document.documentElement.scrollHeight - 0.3 * window.innerHeight
    ) {
      await this.getJournalsPaginated();
    }
  }
}

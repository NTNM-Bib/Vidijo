import { Component, OnInit, AfterViewInit, HostListener } from "@angular/core";
import { JournalService } from "../../shared/journal.service";
import { IJournal } from "../../shared/journal.interface";
import * as _ from "lodash";
import {
  BreakpointObserver,
  BreakpointState,
  Breakpoints,
} from "@angular/cdk/layout";
import { ActivatedRoute, Router, Params } from "@angular/router";
import { ICategory } from "../../shared/category.interface";
import { Title } from "@angular/platform-browser";
import { IsLoadingService } from "@service-work/is-loading";
import { AdminService } from "src/app/admin/shared/admin.service";
import { IJournalsPage } from "../../shared/journals-page.interface";

@Component({
  selector: "app-all",
  templateUrl: "./all.component.html",
  styleUrls: ["./all.component.scss"],
})
export class AllComponent implements OnInit {
  isMobile: boolean;

  adminModeActive: boolean;

  // Journals
  journals: IJournal[] = [];

  // Categories
  availableCategories: ICategory[];
  currentCategory: ICategory = {
    _id: "all",
  } as ICategory;

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
  journalsPage: number = 1;
  journalsPageLimit: number = 20;
  loadedAllJournals: boolean = false;

  sortParam: string = "";
  categoryParam: string = "";

  constructor(
    private journalService: JournalService,
    private breakpointObserver: BreakpointObserver,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private titleService: Title,
    private adminService: AdminService
  ) {}

  async ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    // Check if in admin mode
    this.adminService.adminModeActive.subscribe((active: boolean) => {
      this.adminModeActive = active;
    });

    // Check for route changes
    this.activatedRoute.queryParams.subscribe(async (params) => {
      this.sortParam = params.sort;
      this.categoryParam = params.category;
      await this.getJournalsPage(this.categoryParam, this.sortParam);

      this.titleService.setTitle(`${this.currentCategory.title} - Vidijo`);
    });
  }

  async getJournalsPage(category: string, sort: string) {
    // Reset page when changing sorting
    this.journalsPage = 1;
    this.loadedAllJournals = false;

    const journalsPage: IJournalsPage = await this.journalService
      .getJournalsPage(category, sort)
      .catch();

    this.setCustomAvailableCategories(journalsPage.availableCategories);
    this.setCustomCurrentCategory(journalsPage.category);
    this.journals = journalsPage.journals;
    this.sort = journalsPage.sort;

    this.loadedAllJournals =
      journalsPage.journals.length < this.journalsPageLimit;
  }

  getJournalsPaginated(): Promise<void> {
    const promise: Promise<void> = new Promise<void>((resolve, reject) => {
      this.currentlyLoadingJournals = true;
      this.journalService
        .getJournals(
          `?select=title useGeneratedCover&sort=${
            this.sortParam ? this.sortParam : "+title"
          }&categories=${this.categoryParam ? this.categoryParam : ""}&limit=${
            this.journalsPageLimit
          }&page=${this.journalsPage}`
        )
        .subscribe((journals: any) => {
          if (journals.docs.length < 1) {
            this.loadedAllJournals = true;
          }

          this.journals = this.journals.concat(journals.docs);

          this.currentlyLoadingJournals = false;
          return resolve();
        });
    });

    return promise;
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

  setCustomAvailableCategories(categories: ICategory[]) {
    this.availableCategories = categories.map((category: ICategory) => {
      if (category._id === "all") {
        return {
          _id: category._id,
          title: "All Journals",
          color: category.color,
          icon: "apps",
        } as ICategory;
      }

      if (category._id === "favorites") {
        return {
          _id: category._id,
          title: "My Favorites",
          color: category.color,
          icon: "favorite",
        } as ICategory;
      }

      return category;
    });
  }

  setCustomCurrentCategory(category: ICategory) {
    if (category._id === "all") {
      category.title = "All Journals";
      category.icon = "apps";
      this.currentCategory = category;
      return;
    }

    if (category._id === "favorites") {
      category.title = "My Favorites";
      category.icon = "favorite";
      this.currentCategory = category;
      return;
    }

    this.currentCategory = category;
    return;
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
      this.journalsPage++;
      await this.getJournalsPaginated();
    }
  }
}

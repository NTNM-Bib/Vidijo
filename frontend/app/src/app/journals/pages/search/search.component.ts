import { Component, OnInit, HostListener } from '@angular/core';
import { JournalService } from '../../shared/journal.service';
import { IJournal } from '../../shared/journal.interface';
import { IArticle } from '../../shared/article.interface';
import { ICategory } from '../../shared/category.interface';
import { FormControl } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { IColor } from '../../shared/color.interface';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { ISearchPage } from '../../shared/search-page.interface';

@Component({
  selector: 'app-search',
  templateUrl: './search.component.html',
  styleUrls: ['./search.component.scss']
})
export class SearchComponent implements OnInit {

  isMobile: boolean;

  searchFormControl = new FormControl();

  searchTerm: string = "";

  noSearchResults: boolean = false;
  journalSearchResults: IJournal[] = [];
  articleSearchResults: IArticle[] = [];
  categorySearchResults: ICategory[] = [];

  maxJournals: number = 15;
  maxArticles: number = 15;
  maxCategories: number = 15;

  articleResultsPage: number = 1;
  loadedAllArticleResults: boolean = false;
  currentlyLoadingArticleResults: boolean = false;


  constructor(
    private journalService: JournalService,
    private breakpointObserver: BreakpointObserver,
    private activatedRoute: ActivatedRoute,
    private router: Router
  ) { }


  async ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    // Search if value changes
    this.searchFormControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(async value => {
        // Change route query parameters
        this.applySearch();

        if (value === "") {
          this.journalSearchResults = [];
          this.articleSearchResults = [];
          this.categorySearchResults = [];
          this.noSearchResults = false;
          this.searchTerm = "";
          return;
        }

        // Set search term and reset display limits for journals and articles
        this.searchTerm = value;
        this.noSearchResults = false;

        await this.getSearchPage();

        this.noSearchResults = this.journalSearchResults.length < 1 && this.articleSearchResults.length < 1 && this.categorySearchResults.length < 1;
      });


    // Get search term from query parameters
    this.activatedRoute.queryParams.subscribe(async (params) => {
      const searchTerm = params.q;
      if (searchTerm) {
        this.searchFormControl.setValue(searchTerm);
      }
    });
  }


  async getSearchPage() {
    // Reset paginated article search
    this.articleResultsPage = 1;
    this.loadedAllArticleResults = false;

    if (!this.searchTerm || this.searchTerm === "") {
      this.categorySearchResults = [];
      this.journalSearchResults = [];
      this.articleSearchResults = [];
      return;
    }

    const searchPage: ISearchPage = await this.journalService.getSearchPage(this.searchTerm).catch();

    this.categorySearchResults = searchPage.categories;
    this.journalSearchResults = searchPage.journals;
    this.articleSearchResults = searchPage.articles;

  }


  getArticleResultsPaginated(): Promise<void> {
    const promise: Promise<void> = new Promise<void>((resolve, reject) => {
      this.currentlyLoadingArticleResults = true;
      this.journalService
        .getArticles(`?search=${this.searchTerm}&sort=-pubdate&populate=publishedIn&populateSelect=cover title&limit=15&page=${this.articleResultsPage}&select=title authors pubdate publishedIn doi`)
        .subscribe((articleResults: any) => {
          if (articleResults.docs.length < 1) {
            this.loadedAllArticleResults = true;
          }

          this.articleSearchResults = this.articleSearchResults.concat(articleResults.docs);

          this.currentlyLoadingArticleResults = false;
          return resolve();
        });
    })

    return promise;
  }


  applySearch() {
    const queryParams = {
      q: this.searchFormControl.value
    };

    this.router.navigate(
      [],
      {
        relativeTo: this.activatedRoute,
        queryParams: queryParams,
        queryParamsHandling: "merge"
      }
    );
  }


  // Load next page of articles when scrolled to bottom
  @HostListener("window:scroll")
  async getNextArticlePage() {
    if (!this.searchTerm || this.searchTerm === "" || this.loadedAllArticleResults || this.currentlyLoadingArticleResults) {
      return;
    }

    if (window.scrollY + window.innerHeight >
      document.documentElement.scrollHeight - .3 * window.innerHeight) {
      this.articleResultsPage++;
      await this.getArticleResultsPaginated();
    }
  }

}

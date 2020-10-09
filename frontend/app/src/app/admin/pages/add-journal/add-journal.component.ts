import { Component, OnInit, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { IJournal } from "src/app/journals/shared/journal.interface";
import { JournalService } from "src/app/journals/shared/journal.service";
import { AdminService } from "../../shared/admin.service";
import { debounceTime } from "rxjs/operators";
import { ICategory } from "src/app/journals/shared/category.interface";
import { AlertService } from "src/app/core/alert/alert.service";

@Component({
  selector: "app-add-journal",
  templateUrl: "./add-journal.component.html",
  styleUrls: ["./add-journal.component.scss"],
})
export class AddJournalComponent implements OnInit {
  @Input() category: ICategory;

  searchFormControl = new FormControl();

  journalResultsInVidijo: IJournal[] = [];
  journalResultsInDOAJ: IJournal[] = [];

  noSearchResults: boolean = true;

  journalsListFile: File;

  constructor(
    private journalService: JournalService,
    private adminService: AdminService,
    private alertService: AlertService
  ) {}

  // Dropzone
  onSelect(event) {
    this.journalsListFile = event.addedFiles[0];
  }

  onRemove() {
    this.journalsListFile = null;
  }

  ngOnInit() {
    this.getCategory();

    // Search if value changes
    this.searchFormControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(async (value) => {
        if (value === "") {
          this.journalResultsInVidijo = [];
          this.journalResultsInDOAJ = [];
          this.noSearchResults = false;
          return;
        }

        // Set search term and reset display limits for journals and articles
        this.noSearchResults = false;

        this.search(value).then(() => {
          this.noSearchResults =
            this.journalResultsInVidijo.length < 1 &&
            this.journalResultsInDOAJ.length < 1;
        });
      });
  }

  getCategory() {
    if (!this.category._id) {
      this.category = {
        _id: "all",
        title: "All Journals",
        color: "#ffffff",
      } as ICategory;

      return;
    }

    if (this.category._id === "favorites") {
      this.category = {
        _id: "favorites",
        title: "Favorite Journals",
        color: "#ffffff",
      } as ICategory;

      return;
    }

    this.journalService
      .getCategory(this.category._id)
      .then((category: ICategory) => {
        this.category = category;
      })
      .catch((err) => {});
  }

  search(searchTerm: string): Promise<void> {
    const promise: Promise<void> = new Promise((resolve, reject) => {
      if (this.category._id !== "all") {
        this.journalService
          .getJournals(
            `?search=${searchTerm}&limit=10&sort=+title&categories=!${this.category._id}`
          )
          .subscribe((journalResultsResponse: any) => {
            this.journalResultsInVidijo = journalResultsResponse.docs;
          });
      }

      this.adminService
        .searchJournalsInDOAJ(searchTerm)
        .then((journalsFromDOAJ: IJournal[]) => {
          this.journalResultsInDOAJ = journalsFromDOAJ;
        })
        .catch();
    });

    return promise;
  }
}

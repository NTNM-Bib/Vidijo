import { Component, OnInit, Input } from "@angular/core";
import { FormControl } from "@angular/forms";
import { IJournal } from "src/app/journals/shared/journal.interface";
import { JournalService } from "src/app/journals/shared/journal.service";
import { AdminService, VidijoData } from "../../shared/admin.service";
import { debounceTime } from "rxjs/operators";
import { ICategory } from "src/app/journals/shared/category.interface";
import { AlertService } from "src/app/core/alert/alert.service";
import { Router } from "@angular/router";
import { NavigationService } from "src/app/core/navigation/navigation.service";

@Component({
  selector: "app-add-journal",
  templateUrl: "./add-journal.component.html",
  styleUrls: ["./add-journal.component.scss"],
})
export class AddJournalComponent implements OnInit {
  @Input() category: ICategory;

  searchFormControl = new FormControl();
  searchValue: string = "";

  journalResultsInVidijo: IJournal[] = [];
  journalResultsInDOAJ: IJournal[] = [];

  noSearchResults: boolean = true;

  journalsListFile: File;
  info: any = null;

  constructor(
    private journalService: JournalService,
    private adminService: AdminService,
    private alertService: AlertService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.getCategory();

    // Search if value changes
    this.searchFormControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(async (value) => {
        this.searchValue = value;

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
    if (!this.category?._id) {
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

      this.adminService.searchJournalsInDOAJ(searchTerm).subscribe(
        (result) => {
          this.journalResultsInDOAJ = result.availableJournals;
          this.journalResultsInVidijo = result.alreadyExistingJournals;
        },
        (err) => {
          this.alertService.showSnackbarAlert(
            `Something went wrong when searching journals: ${err}`,
            "Okay",
            () => {},
            5000,
            true
          );
        }
      );
    });

    return promise;
  }

  // Journal importer
  onSelect(event) {
    this.journalsListFile = event.addedFiles[0];

    this.adminService.getXLSXInfo(this.journalsListFile).subscribe(
      (info) => {
        this.info = info;
      },
      (err) => {
        console.error(err);
      }
    );
  }

  onRemove() {
    this.journalsListFile = null;
    this.info = null;
  }

  importJournalsList() {
    if (!this.journalsListFile) return;

    this.alertService.showDialogAlert(
      "Importing Journals...",
      `
      Vidijo now imports all journals from the list.
      This may take a while.
      You can continue using the app as usual or close it.
      `,
      "Okay",
      () => {}
    );

    this.adminService.uploadXLSX(this.journalsListFile).subscribe(
      (success) => {
        this.alertService.showDialogAlert(
          "Imported Journals",
          "Successfully imported journals",
          "Okay",
          () => {}
        );
      },
      (error) => {
        this.alertService.showSnackbarAlert(
          "Cannot import journals",
          "Okay",
          () => {},
          5000,
          true
        );
      }
    );
  }

  openHelpDialog() {
    this.alertService.showDialogAlert(
      "How to Import",
      "You can upload an XLSX file that contains the journals for Vidijo instead of adding them one by one. Download an example file by clicking the button below to get started.",
      "Download Example",
      () => {
        window.open(`static/examples/vidijo.xlsx`);
      }
    );
  }

  showUploadHistory() {
    this.navigationService.navigateToAddJournalUploadedList();
  }
}

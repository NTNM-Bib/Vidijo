import { Component, OnInit, Input } from "@angular/core";
import { JournalService } from "src/app/journals/shared/journal.service";
import { IJournal } from "src/app/journals/shared/journal.interface";
import { ActivatedRoute } from "@angular/router";
import { FormGroup, FormControl } from "@angular/forms";
import { AlertService } from "src/app/core/alert/alert.service";
import { AdminService } from "../../shared/admin.service";
import { ICategory } from "src/app/journals/shared/category.interface";
import { debounceTime } from "rxjs/operators";
import { Location } from "@angular/common";

@Component({
  selector: "app-edit-journal",
  templateUrl: "./edit-journal.component.html",
  styleUrls: ["./edit-journal.component.scss"],
})
export class EditJournalComponent implements OnInit {
  @Input() journal: IJournal;

  form: FormGroup = new FormGroup({
    title: new FormControl(""),
    issn: new FormControl(""),
    eissn: new FormControl(""),
    categories: new FormControl(""),
    useGeneratedCover: new FormControl(false),
  });

  categoriesSearchResults: ICategory[] = [];

  coverFile: File;

  constructor(
    private journalService: JournalService,
    private adminService: AdminService,
    private route: ActivatedRoute,
    private alertService: AlertService,
    private location: Location
  ) {}

  ngOnInit() {
    this.route.params.subscribe(async (params) => {
      this.journalService
        .getJournals(`?_id=${this.journal._id}&populate=categories`)
        .subscribe((journalsResponse: any) => {
          this.journal = journalsResponse.docs[0];
          this.updateForm();
        });
    });

    // Search categories when entering text in the categories chip list
    this.form.controls["categories"].valueChanges
      .pipe(debounceTime(300))
      .subscribe((value: string) => {
        this.journalService
          .searchCategories(value, 10)
          .subscribe((categoriesResponse: any) => {
            this.categoriesSearchResults = categoriesResponse.docs;
            // Only show categories that are not in the categories array of this journal
            this.categoriesSearchResults = this.categoriesSearchResults.filter(
              (value: ICategory) => {
                const res = this.journal.categories.filter(
                  (element: ICategory) => {
                    return element._id === value._id;
                  }
                );

                return res.length < 1;
              }
            );
          });
      });
  }

  updateForm() {
    this.form.controls["title"].setValue(this.journal.title);
    this.form.controls["issn"].setValue(this.journal.issn);
    this.form.controls["eissn"].setValue(this.journal.eissn);
    this.form.controls["useGeneratedCover"].setValue(
      this.journal.useGeneratedCover
    );
  }

  updateJournalData() {
    const updatedJournal = {
      _id: this.journal._id,
      title: this.form.controls["title"].value,
      issn: this.form.controls["issn"].value,
      eissn: this.form.controls["eissn"].value,
      categories: this.transformCategoriesToIdArray(this.journal.categories),
      useGeneratedCover: this.form.controls["useGeneratedCover"].value,
    } as IJournal;

    this.journalService
      .updateJournal(updatedJournal)
      .then((updatedJournal: IJournal) => {
        if (this.coverFile) {
          this.adminService
            .uploadNewCover(this.journal._id, this.coverFile)
            .subscribe(
              (_) => {
                this.alertService.showSnackbarAlert(
                  `Successfully updated journal data and cover`,
                  "Okay",
                  () => {}
                );
              },
              (err: Error) => {
                this.alertService.showSnackbarAlert(
                  `Cannot upload new cover: ${err.message}`,
                  "Okay",
                  () => {},
                  5000,
                  true
                );
              }
            );
        } else {
          this.alertService.showSnackbarAlert(
            `Successfully updated journal data`,
            "Okay",
            () => {}
          );
        }
      })
      .catch((err: Error) => {
        this.alertService.showSnackbarAlert(
          `Cannot update journal data: ${err.message}`,
          "Okay",
          () => {},
          5000,
          true
        );
      });
  }

  confirmDeletingJournal() {
    this.alertService.showDialogAlert(
      "Delete Journal",
      `Do you really want to delete the journal ${this.journal.title}? This cannot be undone!`,
      "Delete Journal",
      () => {
        this.deleteJournal();
      },
      "warn"
    );
  }

  deleteJournal() {
    this.adminService
      .deleteJournal(this.journal._id)
      .then(() => {
        this.alertService.showSnackbarAlert(
          `Journal ${this.journal.title} was deleted successfully`,
          `Okay`,
          () => {}
        );
      })
      .then((_) => {
        this.location.back();
      })
      .catch((err: Error) => {
        this.alertService.showSnackbarAlert(
          `Cannot delete Journal ${this.journal.title}`,
          "Retry",
          () => {
            this.deleteJournal();
          },
          5000,
          true
        );
      });
  }

  transformCategoriesToIdArray(categories: ICategory[]) {
    return categories.map((category: ICategory) => {
      return category._id;
    });
  }

  removeCategoryFromJournal(category: ICategory) {
    this.journal.categories = this.journal.categories.filter(
      (value: ICategory) => {
        return value !== category;
      }
    );
  }

  selectedCategory($event: any) {
    const categoryToAdd: ICategory = $event.option.value;
    this.journal.categories.push(categoryToAdd);
    this.form.controls["categories"].setValue("");
  }

  // Cover dropzone
  onSelectCover(event) {
    this.coverFile = event.addedFiles[0];
  }

  onRemoveCover() {
    this.coverFile = null;
  }

  /*
  getCurrentCover() {
    console.log("Getting cover...");
    const url = `/static/covers/${this.journal._id}`;
    fetch(url)
      .then((response) => {
        console.log("Response", response);
        if (response.status !== 200) {
          throw new Error(`Cannot get cover of journal ${this.journal._id}`);
        }

        return response;
      })
      .then((response) => response.blob().then((blob) => blob))
      .then((blob) => {
        const file = new File([blob], `${this.journal._id}`);

        this.coverFile = file;
      })
      .catch((err) => {
        console.error(err);
      });
  }
  */
}

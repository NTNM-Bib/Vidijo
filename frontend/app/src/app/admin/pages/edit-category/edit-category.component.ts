import { Component, OnInit, Input } from "@angular/core";
import { FormGroup, FormControl } from "@angular/forms";
import { AdminService } from "../../shared/admin.service";
import { AlertService } from "src/app/core/alert/alert.service";
import { ICategory } from "src/app/journals/shared/category.interface";
import { JournalService } from "src/app/journals/shared/journal.service";
import { ActivatedRoute } from "@angular/router";
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from "@angular/cdk/layout";

@Component({
  selector: "app-edit-category",
  templateUrl: "./edit-category.component.html",
  styleUrls: ["./edit-category.component.scss"],
})
export class EditCategoryComponent implements OnInit {
  @Input() category: ICategory;

  color: string = "#0099ff";
  displayOnDiscoverPage: boolean = false;

  form: FormGroup = new FormGroup({
    title: new FormControl(""),
    display: new FormControl(false),
  });

  isMobile: boolean;

  constructor(
    private adminService: AdminService,
    private alertService: AlertService,
    private journalService: JournalService,
    private activatedRoute: ActivatedRoute,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.getCategory();
  }

  getCategory() {
    const id = this.category?._id ?? this.activatedRoute.snapshot.params.id;
    this.journalService.getCategory(id).then((category: ICategory) => {
      this.category = category;
      this.updateForm();
    });
  }

  updateForm() {
    this.form.controls["title"].setValue(this.category.title);
    this.form.controls["display"].setValue(this.category.display);
    this.color = this.category.color;
  }

  updateCategory() {
    const categoryToUpdate = {
      _id: this.category._id,
      title: this.form.controls["title"].value,
      color: this.color,
      display: this.form.controls["display"].value,
    } as ICategory;

    this.adminService
      .updateCategory(categoryToUpdate)
      .then((updatedCategory: ICategory) => {
        this.alertService.showSnackbarAlert(
          `Updated category ${updatedCategory.title}`,
          "Okay",
          () => {}
        );
      })
      .catch((err: Error) => {
        this.alertService.showSnackbarAlert(
          `Failed to update category`,
          "Retry",
          () => {
            this.updateCategory();
          },
          5000,
          true
        );
      });
  }

  confirmDeletingCategory() {
    this.alertService.showDialogAlert(
      "Delete Category",
      `Do you really want to delete the category ${this.category.title}? This cannot be undone! Journals in this category will not be deleted.`,
      "Delete Category",
      () => {
        this.deleteCategory();
      },
      "warn"
    );
  }

  deleteCategory() {
    this.adminService
      .deleteCategory(this.category._id)
      .then(() => {
        this.alertService.showSnackbarAlert(
          `Category ${this.category.title} was deleted successfully`,
          `Okay`,
          () => {}
        );
      })
      .catch((err: Error) => {
        this.alertService.showSnackbarAlert(
          `Cannot delete category ${this.category.title}`,
          "Retry",
          () => {
            this.deleteCategory();
          },
          5000,
          true
        );
      });
  }
}

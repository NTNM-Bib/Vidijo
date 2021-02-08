import { Component, OnInit } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
import { AdminService } from "../../shared/admin.service";
import { AlertService } from "src/app/core/alert/alert.service";
import { ICategory } from "src/app/journals/shared/category.interface";
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from "@angular/cdk/layout";

@Component({
  selector: "app-add-category",
  templateUrl: "./add-category.component.html",
  styleUrls: ["./add-category.component.scss"],
})
export class AddCategoryComponent implements OnInit {
  isMobile: boolean;

  color: string = "#0099ff";

  form: FormGroup = new FormGroup({
    title: new FormControl(""),
    display: new FormControl(false),
  });

  constructor(
    private adminService: AdminService,
    private alertService: AlertService,
    private breakpointObserver: BreakpointObserver
  ) {}

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });
  }

  addCategory() {
    const categoryToAdd = {
      title: this.form.controls["title"].value,
      color: this.color,
      display: this.form.controls["display"].value
        ? this.form.controls["display"].value
        : undefined,
    } as ICategory;

    this.adminService
      .addCategory(categoryToAdd)
      .then((addedCategory: ICategory) => {
        this.alertService.showSnackbarAlert(
          `Added category ${addedCategory.title}`,
          "Okay",
          () => {}
        );
      })
      .catch((err: Error) => {
        this.alertService.showSnackbarAlert(
          `Failed to create category`,
          "Retry",
          () => {
            this.addCategory();
          },
          5000,
          true
        );
      });
  }
}

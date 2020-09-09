import { Component, OnInit, Input } from '@angular/core';
import { IUser } from 'src/app/users/shared/user.interface';
import { AdminService } from '../../shared/admin.service';
import { FormGroup, FormControl } from '@angular/forms';
import { AlertService } from 'src/app/core/alert/alert.service';
import { IsLoadingService } from '@service-work/is-loading';
import { ActivatedRoute } from '@angular/router';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-edit-user',
  templateUrl: './edit-user.component.html',
  styleUrls: ['./edit-user.component.scss']
})
export class EditUserComponent implements OnInit {

  @Input() user: IUser;

  form: FormGroup = new FormGroup(
    {
      isAdmin: new FormControl(false)
    }
  );

  isMobile: boolean;
  

  constructor(
    private adminService: AdminService,
    private alertService: AlertService,
    private isLoadingService: IsLoadingService,
    private activatedRoute: ActivatedRoute,
    private breakpointObserver: BreakpointObserver
  ) { }


  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.activatedRoute.params.subscribe(() => {
      this.getUser();
    });
  }


  getUser() {
    this.isLoadingService.add();
    this.adminService.getUsers(`?_id=${this.user._id}`)
      .then((users: IUser[]) => {
        this.user = users[0];
        this.updateForm();
        this.isLoadingService.remove();
      }).catch(() => {
        this.isLoadingService.remove();
      });
  }


  get isAdmin(): boolean {
    return this.user.accessLevel === "admin";
  }


  get fullNameDescription(): string {
    return `${this.user.firstName} ${this.user.secondName ? this.user.secondName : ""} (${this.user.username})`;
  }


  updateForm() {
    this.form.controls["isAdmin"].setValue(this.isAdmin);
  }


  confirmPromotingToAdmin() {
    this.alertService.showDialogAlert("Promote to Admin", `Do you really want to promote ${this.fullNameDescription} to administrator?`, "Promote to Administrator", () => {
      this.promoteToAdmin();
    }, "accent");
  }


  promoteToAdmin() {
    const updatedUser = {
      _id: this.user._id,
      accessLevel: "admin"
    } as IUser;

    this.adminService.updateUser(updatedUser)
      .then(() => {
        this.alertService.showSnackbarAlert(`User ${this.fullNameDescription} was promoted to administrator`, `Okay`, () => { });
        this.getUser();
      })
      .catch((err: Error) => {
        this.alertService.showSnackbarAlert(`Cannot promote user ${this.fullNameDescription} to administrator`, "Retry", () => {
          this.promoteToAdmin();
        }, 5000, true);
      });
  }


  confirmRemovingAdminStatus() {
    this.alertService.showDialogAlert("Remove Admin Status", `Do you really want to remove the admin status of ${this.fullNameDescription}?`, "Remove Admin Status", () => {
      this.removeAdminStatus();
    }, "warn");
  }


  removeAdminStatus() {
    const updatedUser = {
      _id: this.user._id,
      accessLevel: "default"
    } as IUser;

    this.adminService.updateUser(updatedUser)
      .then(() => {
        this.alertService.showSnackbarAlert(`Admin status of ${this.fullNameDescription} was removed successfully`, `Okay`, () => { });
        this.getUser();
      })
      .catch((err: Error) => {
        this.alertService.showSnackbarAlert(`Cannot remove admin status of user ${this.fullNameDescription}`, "Retry", () => {
          this.removeAdminStatus();
        }, 5000, true);
      });
  }

}

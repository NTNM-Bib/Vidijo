import { Component, OnInit } from "@angular/core";
import { AuthService } from "src/app/auth/auth.service";
import {
  FormGroup,
  FormBuilder,
  Validators,
  ValidatorFn,
  ValidationErrors,
} from "@angular/forms";
import { AlertService } from "src/app/core/alert/alert.service";
import { ActivatedRoute } from "@angular/router";
import { NavigationService } from "src/app/core/navigation/navigation.service";

@Component({
  selector: "app-reset-password",
  templateUrl: "./reset-password.component.html",
  styleUrls: ["./reset-password.component.scss"],
})
export class ResetPasswordComponent implements OnInit {
  form: FormGroup;
  success: boolean = false;

  constructor(
    private authService: AuthService,
    private fb: FormBuilder,
    private alertService: AlertService,
    private route: ActivatedRoute,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.buildForm();
  }

  // Custom validator to check if newPassword matches confirmNewPassword
  passwordsMatchValidator: ValidatorFn = (
    control: FormGroup
  ): ValidationErrors | null => {
    const newPassword = control.get("newPassword").value;
    const confirmNewPassword = control.get("confirmNewPassword").value;
    return newPassword &&
      confirmNewPassword &&
      newPassword !== confirmNewPassword
      ? { passwordsNotMatching: true }
      : null;
  };

  private buildForm() {
    this.form = this.fb.group(
      {
        newPassword: [
          "",
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(128),
          ],
        ],
        confirmNewPassword: [
          "",
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(128),
          ],
        ],
      },
      {
        validators: [this.passwordsMatchValidator],
      }
    );
  }

  get token() {
    const t = this.route.snapshot.params["token"];
    console.log({ t });
    return t;
  }

  get newPassword() {
    return this.form.get("newPassword");
  }

  get confirmNewPassword() {
    return this.form.get("confirmNewPassword");
  }

  resetPassword() {
    this.authService
      .resetPassword(this.token, this.newPassword.value)
      .subscribe(
        (_) => {
          this.success = true;
        },
        (_) => {
          this.success = false;
          this.alertService.showDialogAlert(
            "Error",
            "We cannot change the password. The reset link may have expired or the user does not exist. You can request a new reset mail and try again.",
            "Okay",
            () => {},
            "primary"
          );
        }
      );
  }

  openLogin() {
    this.navigationService.navigateToLogin();
  }
}

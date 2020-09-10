import { Component, OnInit } from "@angular/core";
import { FormBuilder, FormGroup, Validators } from "@angular/forms";
import { AuthService } from "src/app/auth/auth.service";
import { AlertService } from "src/app/core/alert/alert.service";

@Component({
  selector: "app-request-password-reset",
  templateUrl: "./request-password-reset.component.html",
  styleUrls: ["./request-password-reset.component.scss"],
})
export class RequestPasswordResetComponent implements OnInit {
  form: FormGroup;
  success: boolean = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private alertService: AlertService
  ) {}

  ngOnInit() {
    this.form = this.fb.group({
      email: ["", [Validators.required, Validators.email]],
    });
  }

  get email() {
    return this.form.get("email");
  }

  submitForm() {
    this.authService.requestPasswordReset(this.email.value).subscribe(
      (_) => {
        this.success = true;
      },
      (_) => {
        this.success = false;
        this.alertService.showDialogAlert(
          "Error",
          "We cannot send a password reset mail. This service might be unavailable or the provided email address does not exist.",
          "Okay",
          () => {},
          "primary"
        );
      }
    );
  }
}

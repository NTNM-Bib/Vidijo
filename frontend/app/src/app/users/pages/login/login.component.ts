import { Component, OnInit } from "@angular/core";
import { FormGroup, FormBuilder, Validators } from "@angular/forms";
import { IUser } from "../../shared/user.interface";
import { Router } from "@angular/router";
import { AuthService } from "src/app/auth/auth.service";
import { AlertService } from "src/app/core/alert/alert.service";
import { NavigationService } from "src/app/core/navigation/navigation.service";
import {
  BreakpointObserver,
  Breakpoints,
  BreakpointState,
} from "@angular/cdk/layout";
import { HttpErrorResponse } from "@angular/common/http";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  isMobile: boolean;

  form: FormGroup;

  loginPasswordVisible: boolean = false;

  loginError: boolean = false;
  loginErrorText: string = "";

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private navigationService: NavigationService,
    private breakpointObserver: BreakpointObserver,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.buildForm();

    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.form.statusChanges.subscribe(() => {
      this.clearLoginError();
    });
  }

  private buildForm() {
    this.form = this.fb.group({
      username: ["", [Validators.required, Validators.email]],
      password: ["", [Validators.required]],
    });
  }

  public login() {
    const userToLogin: IUser = {
      username: this.username.value,
      password: this.password.value,
    } as IUser;

    this.authService.login(userToLogin).subscribe(
      (user: IUser) => {
        const isOnVerifyPage = this.router.url.split("/")[2] === "verify";
        if (isOnVerifyPage || this.isMobile) {
          return this.navigationService.navigateToHome();
        }

        // Show snackbar if not already on home page
        if (this.router.url.split("?")[0] !== "/home") {
          this.alertService.showSnackbarAlert(
            `Hello, ${user.firstName}`,
            "Visit my Page",
            () => {
              this.router.navigate(["/home"]);
            }
          );
        }

        // Close the login dialog
        this.navigationService.closeDialog();
      },
      (error: HttpErrorResponse) => {
        this.showLoginError(error.error.message);
      }
    );

    // Show onboarding if necessary
    this.authService.currentUser.subscribe((user: IUser) => {
      if (user && user.showOnboarding) {
      }
    });
  }

  private showLoginError(message: string) {
    this.loginErrorText = message;
    this.loginError = true;
  }

  private clearLoginError() {
    this.loginError = false;
    this.loginErrorText = "";
  }

  public openOnboarding(firstName: string) {
    this.navigationService.navigateToOnboarding();
  }

  public openRegisterPage() {
    this.navigationService.navigateToRegister();
  }

  public openPasswordResetRequest() {
    this.navigationService.navigateToPasswordResetRequest();
  }

  get username() {
    return this.form.get("username");
  }

  get password() {
    return this.form.get("password");
  }
}

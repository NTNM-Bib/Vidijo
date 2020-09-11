import { Component, OnInit, Injector } from "@angular/core";
import { FormControl, FormGroup } from "@angular/forms";
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
import { Location } from "@angular/common";

@Component({
  selector: "app-login",
  templateUrl: "./login.component.html",
  styleUrls: ["./login.component.scss"],
})
export class LoginComponent implements OnInit {
  isMobile: boolean;

  form = new FormGroup({
    username: new FormControl(),
    password: new FormControl(),
  });

  loginPasswordVisible: boolean = false;

  loginError: boolean = false;
  loginErrorText: string = "";

  constructor(
    private authService: AuthService,
    private router: Router,
    private alertService: AlertService,
    private navigationService: NavigationService,
    private breakpointObserver: BreakpointObserver,
    private location: Location
  ) {}

  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.form.statusChanges.subscribe(() => {
      this.clearLoginError();
    });

    this.authService.currentUser.subscribe((user) => {
      if (user) {
        this.alertService.showSnackbarAlert(
          `Hello, ${user.firstName}`,
          "Visit my Page",
          () => {
            this.router.navigate(["/home"]);
          }
        );
        this.navigationService.closeDialog();
      }
    });
  }

  public login() {
    const userToLogin: IUser = {
      username: this.form.get("username").value,
      password: this.form.get("password").value,
    } as IUser;

    this.authService.login(userToLogin);

    if (this.isMobile) {
      this.navigationService.navigateToHome();
    }

    // Show onboarding if necessary
    this.authService.currentUser.subscribe((user: IUser) => {
      if (user && user.showOnboarding) {
        this.navigationService.navigateToOnboarding();
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
}

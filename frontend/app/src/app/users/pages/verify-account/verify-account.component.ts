import { Component, OnInit } from "@angular/core";
import { ActivatedRoute } from "@angular/router";
import { AuthService } from "src/app/auth/auth.service";
import { NavigationService } from "src/app/core/navigation/navigation.service";

@Component({
  selector: "app-verify-account",
  templateUrl: "./verify-account.component.html",
  styleUrls: ["./verify-account.component.scss"],
})
export class VerifyAccountComponent implements OnInit {
  loading: boolean = true;
  success: boolean = false;
  alreadyVerified: boolean = false;

  constructor(
    private route: ActivatedRoute,
    private authService: AuthService,
    private navigationService: NavigationService
  ) {}

  ngOnInit() {
    this.loading = true;
    this.verifyToken();
  }

  get token(): string {
    return this.route.snapshot.params["token"];
  }

  get error(): boolean {
    return !this.loading && !(this.success || this.alreadyVerified);
  }

  verifyToken() {
    this.authService.verify(this.token).subscribe(
      (response) => {
        this.loading = false;
        this.success = response.success === true;
        this.alreadyVerified = response.alreadyVerified === true;
      },
      () => {
        this.loading = false;
        this.success = false;
        this.alreadyVerified = false;
      }
    );
  }

  openLogin() {
    this.navigationService.navigateToLogin();
  }
}

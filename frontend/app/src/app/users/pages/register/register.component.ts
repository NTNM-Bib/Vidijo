import { Component, OnInit } from "@angular/core";
import {
  Validators,
  FormGroup,
  ValidationErrors,
  FormBuilder,
  ValidatorFn,
} from "@angular/forms";
import { IUser } from "../../shared/user.interface";
import { AuthService } from "src/app/auth/auth.service";
import { AlertService } from "src/app/core/alert/alert.service";
import { NavigationService } from "src/app/core/navigation/navigation.service";

@Component({
  selector: "app-register",
  templateUrl: "./register.component.html",
  styleUrls: ["./register.component.scss"],
})
export class RegisterComponent implements OnInit {
  form: FormGroup;

  registerPasswordVisible: boolean = false;
  registerRetypedPasswordVisible: boolean = false;

  registerError: boolean = false;
  registerErrorText: string = "";

  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private navigationService: NavigationService,
    private fb: FormBuilder
  ) {}

  ngOnInit() {
    this.buildForm();

    this.form.statusChanges.subscribe(() => {
      this.clearRegisterError();
    });
  }

  private buildForm() {
    this.form = this.fb.group(
      {
        firstName: [
          "",
          [
            Validators.required,
            Validators.minLength(1),
            Validators.maxLength(50),
          ],
        ],
        lastName: ["", [Validators.minLength(1), Validators.maxLength(50)]],
        username: ["", [Validators.required, Validators.email]],
        password: [
          "",
          [
            Validators.required,
            Validators.minLength(10),
            Validators.maxLength(128),
          ],
        ],
        retypedPassword: [
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

  // Custom validator to check if newPassword matches confirmNewPassword
  passwordsMatchValidator: ValidatorFn = (
    control: FormGroup
  ): ValidationErrors | null => {
    const password = control.get("password").value;
    const retypedPassword = control.get("retypedPassword").value;

    if (password && retypedPassword && password !== retypedPassword) {
      const error = { passwordsNotMatching: true };
      control.get("retypedPassword").setErrors(error);
      return error;
    }
    return null;
  };

  public openLogin() {
    this.navigationService.navigateToLogin();
  }

  public register() {
    /*
    if (this.form.invalid) {
      this.showRegisterError("Please check the data you entered");
    }
    */

    const password: string = this.form.controls["password"].value;
    //const retypedPassword: string = this.form.controls["retypedPassword"].value;

    const firstName: string = this.form.controls["firstName"].value;
    let secondName: string | undefined = this.form.controls["lastName"].value;
    if (secondName.length < 1) {
      secondName = undefined;
    }
    const username: string = this.form.controls["username"].value;

    const newUser: IUser = {
      username: username,
      password: password,
      firstName: firstName,
      secondName: secondName,
    } as IUser;

    this.authService.register(newUser).subscribe(
      (user: IUser) => {
        this.navigationService.closeDialog();
        this.showRegistrationCompleteMessage();
      },
      (err: any) => {
        this.showRegisterError(err.message);
      }
    );
  }

  private showRegisterError(message: string) {
    this.registerErrorText = message;
    this.registerError = true;
  }

  private clearRegisterError() {
    this.registerError = false;
    this.registerErrorText = "";
  }

  private showRegistrationCompleteMessage() {
    this.alertService.showDialogAlert(
      "Your Account has been created!",
      "We will soon send a verification email to your address. Once you have verified your account, you can log in to Vidijo.",
      "Okay",
      () => {},
      "primary"
    );
  }

  get firstName() {
    return this.form.get("firstName");
  }

  get lastName() {
    return this.form.get("lastName");
  }

  get username() {
    return this.form.get("username");
  }

  get password() {
    return this.form.get("password");
  }

  get retypedPassword() {
    return this.form.get("retypedPassword");
  }

  get firstNameError() {
    if (!this.firstName.value.length) return "";

    return this.firstName.hasError("required")
      ? "Please enter your first name"
      : this.firstName.hasError("minlength")
      ? "Your first name is too short"
      : this.firstName.hasError("maxlength")
      ? "Your first name is too long"
      : "";
  }

  get lastNameError() {
    if (!this.lastName.value.length) return "";

    return this.lastName.hasError("minlength")
      ? "Your last name is too short"
      : this.lastName.hasError("maxlength")
      ? "Your last name is too long"
      : "";
  }

  get usernameError() {
    if (!this.username.value.length) return "";

    return this.username.hasError("required")
      ? "Please enter your email address"
      : this.username.hasError("email")
      ? "Please enter a valid email address"
      : "";
  }

  get passwordError() {
    if (!this.password.value.length) return "";

    return this.password.hasError("required")
      ? "Please enter a password"
      : this.password.hasError("minlength")
      ? "Your password is too short"
      : this.password.hasError("maxlength")
      ? "Your password is too long"
      : "";
  }
}

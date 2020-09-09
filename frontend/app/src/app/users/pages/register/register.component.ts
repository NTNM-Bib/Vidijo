import { Component, OnInit, Injector } from '@angular/core';
import { FormControl, Validators, FormGroupDirective, FormGroup, AbstractControl, ValidationErrors } from '@angular/forms';
import { IUser } from '../../shared/user.interface';
import { AuthService } from 'src/app/auth/auth.service';
import { AlertService } from 'src/app/core/alert/alert.service';
import { ErrorStateMatcher } from '@angular/material/core';
import { NavigationService } from 'src/app/core/navigation/navigation.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.scss']
})
export class RegisterComponent implements OnInit {

  form = new FormGroup(
    {
      firstName: new FormControl('', [
        Validators.required,
        Validators.minLength(1),
        Validators.maxLength(50),
      ]),
      lastName: new FormControl('', [
        Validators.minLength(1),
        Validators.maxLength(50),
      ]),
      username: new FormControl('', [
        Validators.required,
        Validators.email
      ]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(10),
        Validators.maxLength(128),
      ]),
      retypedPassword: new FormControl('', [
        Validators.required,
      ])
    }
  );

  registerPasswordVisible: boolean = false;
  registerRetypedPasswordVisible: boolean = false;

  registerError: boolean = false;
  registerErrorText: string = "";


  constructor(
    private authService: AuthService,
    private alertService: AlertService,
    private injector: Injector,
    private navigationService: NavigationService
  ) { }


  ngOnInit() {
    this.form.statusChanges.subscribe(() => {
      this.clearRegisterError();
    });
  }


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
      secondName: secondName
    } as IUser;

    this.authService.register(newUser).subscribe((user: IUser) => {
      this.navigationService.closeDialog();
      this.showRegistrationCompleteMessage();
    },
      (err: any) => {
        this.showRegisterError(err.message);
      });
  }


  public getFirstNameErrorMessage() {
    const firstName: AbstractControl = this.form.controls["firstName"];

    return (firstName.hasError("required")) ? "Please enter your first name" :
      (firstName.hasError("minlength")) ? "Your first name is too short" :
        (firstName.hasError("maxlength")) ? "Your first name is too long" :
          "";
  }


  public getLastNameErrorMessage() {
    const lastName: AbstractControl = this.form.controls["lastName"];

    return (lastName.hasError("minlength")) ? "Your last name is too short" :
      (lastName.hasError("maxlength")) ? "Your last name is too long" :
        "";
  }


  public getUsernameErrorMessage() {
    const username: AbstractControl = this.form.controls["username"];

    return (username.hasError("required")) ? "Please enter your email address" :
      (username.hasError("email")) ? "Please enter a valid email address" :
        "";
  }


  public getPasswordErrorMessage() {
    const password: AbstractControl = this.form.controls["password"];

    return (password.hasError("required")) ? "Please enter a password" :
      (password.hasError("minlength")) ? "Your password is too short" :
        (password.hasError("maxlength")) ? "Your password is too long" :
          "";
  }


  retypedPasswordErrorMatcher: ErrorStateMatcher = {
    isErrorState: (control: FormControl, form: FormGroupDirective): boolean => {
      const controlInvalid = control.touched && control.invalid;

      const passwordsMismatch: boolean = control.value !== this.form.get("password").value;
      return controlInvalid || passwordsMismatch;
    }
  };


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

}

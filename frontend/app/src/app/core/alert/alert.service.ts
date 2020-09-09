import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarRef, SimpleSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';
import { Subscription } from 'rxjs';
import { AlertDialogComponent } from './alert-dialog/alert-dialog.component';

@Injectable({
  providedIn: 'root'
})
export class AlertService {

  private snackBarRef: MatSnackBarRef<SimpleSnackBar>;
  private snackBarActionSubscription: Subscription;


  constructor(
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) { }


  public showSnackbarAlert(message: string, actionTitle: string, action: () => void, duration: number = 5000, isError: boolean = false) {
    let snackBarConfig: MatSnackBarConfig = {
      duration: duration,
      panelClass: ["g_snackbar"],
      verticalPosition: "bottom",
      horizontalPosition: "center"
    }

    if (isError) {
      snackBarConfig.panelClass = ["g_snackbar-error"]
    }

    this.snackBarRef = this.snackBar.open(message, actionTitle, snackBarConfig);

    this.snackBarActionSubscription = this.snackBarRef.onAction().subscribe(action);

    setTimeout(() => {
      this.snackBarActionSubscription.unsubscribe();
    }, duration);
  }


  public showDialogAlert(title: string, message: string, actionTitle: string = "Okay", action: () => void, actionButtonColor: "primary" | "accent" | "warn" = "primary") {
    this.dialog.open(AlertDialogComponent, {
      autoFocus: false,
      disableClose: true,
      panelClass: "g_dialog-sm",
      backdropClass: "g_dialog-backdrop",
      data: {
        title: title,
        message: message,
        actionTitle: actionTitle,
        action: action,
        actionButtonColor: actionButtonColor
      }
    });
  }
}

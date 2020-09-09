import { Component, OnInit, Inject, HostListener } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';

@Component({
  selector: 'app-alert-dialog',
  templateUrl: './alert-dialog.component.html',
  styleUrls: ['./alert-dialog.component.scss']
})
export class AlertDialogComponent implements OnInit {

  title: string;
  message: string;
  actionTitle: string;
  action: () => void;
  actionButtonColor: string;


  constructor(
    @Inject(MAT_DIALOG_DATA) public data: any,
    private dialogRef: MatDialogRef<AlertDialogComponent>
  ) { }


  ngOnInit() {
    this.title = this.data.title;
    this.message = this.data.message;
    this.actionTitle = this.data.actionTitle;
    this.action = this.data.action;
    this.actionButtonColor = this.data.actionButtonColor ? this.data.actionButtonColor : "primary";
  }


  @HostListener('window:keyup.esc') onKeyUp() {
    this.closeDialog();
  }


  closeDialog() {
    this.dialogRef.close();
  }


  performActionAndClose() {
    this.action();
    this.closeDialog();
  }

}

import { Component, OnInit, Inject } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { NavigationService } from 'src/app/core/navigation/navigation.service';

@Component({
  selector: 'app-onboarding',
  templateUrl: './onboarding.component.html',
  styleUrls: ['./onboarding.component.scss']
})
export class OnboardingComponent implements OnInit {

  constructor(
    private navigationService: NavigationService
  ) { }


  ngOnInit() {
  }


  openDiscover() {
    this.navigationService.navigateToDiscover();
  }

}

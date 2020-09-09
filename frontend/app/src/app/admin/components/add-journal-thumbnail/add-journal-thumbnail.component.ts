import { Component, OnInit } from '@angular/core';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { NavigationService } from 'src/app/core/navigation/navigation.service';
import { ActivatedRoute } from '@angular/router';


@Component({
  selector: 'app-add-journal-thumbnail',
  templateUrl: './add-journal-thumbnail.component.html',
  styleUrls: ['./add-journal-thumbnail.component.scss']
})
export class AddJournalThumbnailComponent implements OnInit {

  isMobile: boolean;


  constructor(
    private breakpointObserver: BreakpointObserver,
    private navigationService: NavigationService,
    private route: ActivatedRoute
  ) { }


  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });
  }


  navigateToAddJournal() {
    this.navigationService.navigateToAddJournal(this.route.snapshot.queryParams.category);
  }

}

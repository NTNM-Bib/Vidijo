import { Component, OnInit, Input } from "@angular/core";
import { IJournal } from "../../shared/journal.interface";
import { JournalService } from '../../shared/journal.service';
import { IArticle } from '../../shared/article.interface';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { NavigationService } from 'src/app/core/navigation/navigation.service';

@Component({
  selector: "app-journal-newest-articles",
  templateUrl: "./journal-newest-articles.component.html",
  styleUrls: ["./journal-newest-articles.component.scss"]
})
export class JournalNewestArticlesComponent implements OnInit {

  @Input() journal: IJournal;

  isMobile: boolean = false;


  constructor(
    private journalService: JournalService,
    private breakpointObserver: BreakpointObserver,
    private navigationService: NavigationService
  ) { }


  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset, Breakpoints.Tablet])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });
  }


  openJournal() {
    this.navigationService.navigateToJournal(this.journal._id);
  }
}

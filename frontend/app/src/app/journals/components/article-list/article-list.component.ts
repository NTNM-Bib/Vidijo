import { Component, OnInit, Input } from '@angular/core';
import { IArticle } from '../../shared/article.interface';
import { IJournal } from '../../shared/journal.interface';
import { NavigationService } from 'src/app/core/navigation/navigation.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';

@Component({
  selector: 'app-article-list',
  templateUrl: './article-list.component.html',
  styleUrls: ['./article-list.component.scss']
})
export class ArticleListComponent implements OnInit {

  @Input() articles: IArticle[];
  @Input() showCover: boolean = true;
  @Input() showOpenButton: boolean = true;

  isMobile: boolean;


  constructor(
    private navigationService: NavigationService,
    private breakpointObserver: BreakpointObserver
  ) { }


  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });
  }


  openArticle(article: IArticle) {
    this.navigationService.navigateToArticle(article._id);
  }

  openJournal(journal: IJournal) {
    this.navigationService.navigateToJournal(journal._id);
  }

}

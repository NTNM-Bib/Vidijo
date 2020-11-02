import { NgModule } from "@angular/core";
import { DatePipe } from "@angular/common";
import { DiscoverComponent } from "./pages/discover/discover.component";
import { AllComponent } from "./pages/all/all.component";
import { JournalGridComponent } from "./components/journal-grid/journal-grid.component";

import { JournalsRoutingModule } from "./journals-routing.module";
import { JournalComponent } from "./pages/journal/journal.component";
import { ArticleComponent } from "./pages/article/article.component";
import { JournalScrollbarComponent } from "./components/journal-scrollbar/journal-scrollbar.component";
import { JournalNewestArticlesComponent } from "./components/journal-newest-articles/journal-newest-articles.component";

import { JournalCategoryComponent } from "./components/journal-category/journal-category.component";
import { CategoriesComponent } from "./pages/categories/categories.component";
import { JournalThumbnailComponent } from "./components/journal-thumbnail/journal-thumbnail.component";
import { SearchComponent } from "./pages/search/search.component";
import { ArticleListComponent } from "./components/article-list/article-list.component";

import { AdminModule } from "../admin/admin.module";
import { SharedModule } from "../shared/shared.module";

@NgModule({
  imports: [SharedModule, JournalsRoutingModule, AdminModule],
  exports: [
    JournalGridComponent,
    JournalThumbnailComponent,
    ArticleListComponent,
    JournalNewestArticlesComponent,
  ],
  declarations: [
    DiscoverComponent,
    AllComponent,
    JournalGridComponent,
    JournalComponent,
    ArticleComponent,
    JournalScrollbarComponent,
    JournalNewestArticlesComponent,
    JournalCategoryComponent,
    CategoriesComponent,
    JournalThumbnailComponent,
    SearchComponent,
    ArticleListComponent,
  ],
  providers: [DatePipe],
})
export class JournalsModule {}

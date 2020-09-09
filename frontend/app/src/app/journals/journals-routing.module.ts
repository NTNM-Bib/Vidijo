import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { JournalComponent } from "./pages/journal/journal.component";
import { ArticleComponent } from "./pages/article/article.component";

const routes: Routes = [
  { path: "j/:id", component: JournalComponent},
  { path: "a/:id", component: ArticleComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class JournalsRoutingModule {}

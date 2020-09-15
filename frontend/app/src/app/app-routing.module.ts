import { NgModule } from "@angular/core";
import { RouterModule, Routes } from "@angular/router";
import { AllComponent } from "./journals/pages/all/all.component";
import { JournalsModule } from "./journals/journals.module";
import { DiscoverComponent } from "./journals/pages/discover/discover.component";
import { CategoriesComponent } from "./journals/pages/categories/categories.component";
import { HomeComponent } from "./users/pages/home/home.component";
import { AuthGuard } from "./auth/auth.guard";
import { InfoComponent } from "./info/pages/info/info.component";
import { LoginComponent } from "./users/pages/login/login.component";
import { RegisterComponent } from "./users/pages/register/register.component";
import { ReadingListComponent } from "./users/pages/reading-list/reading-list.component";
import { SearchComponent } from "./journals/pages/search/search.component";
import { AdminComponent } from "./admin/pages/admin/admin.component";
import { AddJournalComponent } from "./admin/pages/add-journal/add-journal.component";
import { EditJournalComponent } from "./admin/pages/edit-journal/edit-journal.component";
import { EditUserComponent } from "./admin/pages/edit-user/edit-user.component";
import { EditCategoryComponent } from "./admin/pages/edit-category/edit-category.component";
import { OnboardingComponent } from "./info/pages/onboarding/onboarding.component";
import { ErrorComponent } from "./info/pages/error/error.component";
import { RequestPasswordResetComponent } from "./users/pages/request-password-reset/request-password-reset.component";
import { ResetPasswordComponent } from "./users/pages/reset-password/reset-password.component";
import { VerifyAccountComponent } from "./users/pages/verify-account/verify-account.component";

const routes: Routes = [
  { path: "", redirectTo: "journals", pathMatch: "full" },
  {
    path: "home",
    component: HomeComponent,
    data: { animation: "Home", title: "Home - Vidijo" },
  },
  {
    path: "journals",
    component: AllComponent,
    data: { animation: "Journals", title: "All Journals - Vidijo" },
  },
  {
    path: "discover",
    component: DiscoverComponent,
    data: { animation: "Discover", title: "Discover - Vidijo" },
  },
  {
    path: "categories",
    component: CategoriesComponent,
    data: { animation: "Categories", title: "Categories - Vidijo" },
  },
  {
    path: "info",
    component: InfoComponent,
    data: { title: "Information - Vidijo" },
  },
  {
    path: "onboarding",
    component: OnboardingComponent,
    data: { title: "First Steps - Vidijo" },
  },
  {
    path: "login",
    component: LoginComponent,
    data: { title: "Login - Vidijo" },
  },
  {
    path: "register",
    component: RegisterComponent,
    data: { title: "Create Account - Vidijo" },
  },
  {
    path: "readingList",
    component: ReadingListComponent,
    data: { title: "Reading List - Vidijo" },
  },
  {
    path: "search",
    component: SearchComponent,
    data: { title: "Search - Vidijo" },
  },
  {
    path: "users",
    component: AdminComponent,
    data: { title: "Users - Vidijo" },
  },
  {
    path: "add-journals",
    component: AddJournalComponent,
    data: { title: "Add Journals - Vidijo" },
  },
  {
    path: "edit-journal/:id",
    component: EditJournalComponent,
    data: { title: "Edit Journal - Vidijo" },
  },
  {
    path: "edit-category/:id",
    component: EditCategoryComponent,
    data: { title: "Edit Category - Vidijo" },
  },
  {
    path: "edit-user/:id",
    component: EditUserComponent,
    data: { title: "Edit User - Vidijo" },
  },
  {
    path: "account/request-password-reset",
    component: RequestPasswordResetComponent,
    data: { title: "I forgot my password - Vidijo" },
  },
  {
    path: "account/reset-password/:token",
    component: ResetPasswordComponent,
    data: { title: "Choose a new password - Vidijo" },
  },
  {
    path: "account/verify/:token",
    component: VerifyAccountComponent,
    data: { title: "Verify your account - Vidijo" },
  },
  { path: "**", component: ErrorComponent, data: { title: "Oops! - Vidijo" } },
];

@NgModule({
  imports: [
    JournalsModule,
    RouterModule.forRoot(routes, {
      scrollPositionRestoration: "disabled",
      anchorScrolling: "enabled",
      scrollOffset: [0, 60],
    }),
  ],
  exports: [RouterModule],
})
export class AppRoutingModule {}

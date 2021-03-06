import { BrowserModule } from "@angular/platform-browser";
import { NgModule } from "@angular/core";
import { FormsModule, ReactiveFormsModule } from "@angular/forms";
import { HttpClient, HttpClientModule } from "@angular/common/http";
import { BrowserAnimationsModule } from "@angular/platform-browser/animations";

import { MaterialModule } from "./material.module";
import { LayoutModule } from "@angular/cdk/layout";

import { AppRoutingModule } from "./app-routing.module";
import { AppComponent } from "./app.component";

import { InfoModule } from "./info/info.module";
import { UsersModule } from "./users/users.module";
import { JournalsModule } from "./journals/journals.module";
import { AlertModule } from "./core/alert/alert.module";
import { AlertDialogComponent } from "./core/alert/alert-dialog/alert-dialog.component";
import { ComponentDialogComponent } from "./core/open/component-dialog/component-dialog.component";
import { OpenModule } from "./core/open/open.module";
import { ToolbarComponent } from "./toolbar/toolbar.component";
import { OnboardingComponent } from "./info/pages/onboarding/onboarding.component";
import { ServiceWorkerModule } from "@angular/service-worker";
import { environment } from "../environments/environment";
import { NavigationModule } from "./navigation/navigation.module";
import { DatabaseModule } from "./core/database/database.module";
import { AdminModule } from "./admin/admin.module";

import { MarkdownModule } from "ngx-markdown";

@NgModule({
  declarations: [AppComponent, ToolbarComponent],
  imports: [
    BrowserModule,
    LayoutModule,
    FormsModule,
    ReactiveFormsModule,
    HttpClientModule,
    AppRoutingModule,
    BrowserAnimationsModule,
    MaterialModule,
    InfoModule,
    UsersModule,
    JournalsModule,
    AlertModule,
    OpenModule,
    DatabaseModule,
    NavigationModule,
    AdminModule,
    ServiceWorkerModule.register("ngsw-worker.js", {
      enabled: environment.production,
      registrationStrategy: "registerImmediately",
    }),
    MarkdownModule.forRoot({ loader: HttpClient }),
  ],
  providers: [],
  entryComponents: [
    AlertDialogComponent,
    ComponentDialogComponent,
    OnboardingComponent,
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}

import { NgModule } from "@angular/core";
import { CommonModule } from "@angular/common";
import { InfoComponent } from "./pages/info/info.component";
import { MaterialModule } from "../material.module";
import { OnboardingComponent } from "./pages/onboarding/onboarding.component";
import { ErrorComponent } from "./pages/error/error.component";
import { MarkdownModule } from "ngx-markdown";

@NgModule({
  imports: [CommonModule, MaterialModule, MarkdownModule.forChild()],
  declarations: [InfoComponent, OnboardingComponent, ErrorComponent],
})
export class InfoModule {}

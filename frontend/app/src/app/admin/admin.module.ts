import { NgModule } from '@angular/core';
import { AddJournalThumbnailComponent } from './components/add-journal-thumbnail/add-journal-thumbnail.component';
import { AddJournalComponent } from './pages/add-journal/add-journal.component';
import { AdminComponent } from './pages/admin/admin.component';
import { EditJournalComponent } from './pages/edit-journal/edit-journal.component';
import { SharedModule } from '../shared/shared.module';
import { AddCategoryComponent } from './pages/add-category/add-category.component';
import { EditCategoryComponent } from './pages/edit-category/edit-category.component';
import { AddCategoryThumbnailComponent } from './components/add-category-thumbnail/add-category-thumbnail.component';
import { EditUserComponent } from './pages/edit-user/edit-user.component';
import { NgxDropzoneModule } from "ngx-dropzone";
import { AddJournalUploadedListComponent } from './components/add-journal-uploaded-list/add-journal-uploaded-list.component'



@NgModule({
  declarations: [
    AddJournalThumbnailComponent,
    AddJournalComponent,
    AdminComponent,
    EditJournalComponent,
    AddCategoryComponent,
    EditCategoryComponent,
    AddCategoryThumbnailComponent,
    EditUserComponent,
    AddJournalUploadedListComponent
  ],
  imports: [
    SharedModule,
    NgxDropzoneModule
  ],
  exports: [
    AddJournalThumbnailComponent,
    AddCategoryThumbnailComponent
  ],
  entryComponents: [
    AddJournalComponent,
    EditJournalComponent,
    AddCategoryComponent,
    EditCategoryComponent
  ]
})
export class AdminModule { }

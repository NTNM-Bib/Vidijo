import { Component, OnInit, Input } from '@angular/core';
import { IUser } from 'src/app/users/shared/user.interface';
import { NavigationService } from 'src/app/core/navigation/navigation.service';

@Component({
  selector: 'app-users-list',
  templateUrl: './users-list.component.html',
  styleUrls: ['./users-list.component.scss']
})
export class UsersListComponent implements OnInit {

  @Input() users: IUser[];


  constructor(
    private navigationService: NavigationService
  ) { }


  ngOnInit() {
  }


  navigateToEditUser(user: IUser) {
    this.navigationService.navigateToEditUser(user._id);
  }

}

import { Component, OnInit } from '@angular/core';
import { NavigationService } from 'src/app/core/navigation/navigation.service';
import { BreakpointObserver, Breakpoints, BreakpointState } from '@angular/cdk/layout';
import { FormControl } from '@angular/forms';
import { IUser } from 'src/app/users/shared/user.interface';
import { AdminService } from '../../shared/admin.service';
import { debounceTime } from 'rxjs/operators';
import { ActivatedRoute } from '@angular/router';
import { IsLoadingService } from '@service-work/is-loading';

@Component({
  selector: 'app-admin',
  templateUrl: './admin.component.html',
  styleUrls: ['./admin.component.scss']
})
export class AdminComponent implements OnInit {

  isMobile: boolean;

  filterUsersFormControl: FormControl = new FormControl("");

  searchTerm: string = "";
  noSearchResults: boolean = false;
  adminUsersResults: IUser[] = [];
  defaultUsersResults: IUser[] = [];


  constructor(
    private navigationService: NavigationService,
    private breakpointObserver: BreakpointObserver,
    private adminService: AdminService,
    private activatedRoute: ActivatedRoute,
    private isLoadingService: IsLoadingService
  ) { }


  ngOnInit() {
    this.breakpointObserver
      .observe([Breakpoints.Handset])
      .subscribe((state: BreakpointState) => {
        this.isMobile = state.matches;
      });

    this.filterUsersFormControl.valueChanges
      .pipe(debounceTime(300))
      .subscribe(() => {
        this.getAdminUsers();
        this.getDefaultUsers();
      });

    this.activatedRoute.queryParams.subscribe(async () => {
      this.getAdminUsers();
      this.getDefaultUsers();
    });
  }


  getAdminUsers() {
    this.isLoadingService.add();
    this.adminService.getUsers(`?accessLevel=admin&search=${this.filterUsersFormControl.value}`)
      .then((users: IUser[]) => {
        this.adminUsersResults = users;
        this.isLoadingService.remove();
      }).catch(() => {
        this.isLoadingService.remove();
      });
  }


  getDefaultUsers() {
    this.isLoadingService.add();
    this.adminService.getUsers(`?accessLevel=!admin&search=${this.filterUsersFormControl.value}`)
      .then((users: IUser[]) => {
        this.defaultUsersResults = users;
        this.isLoadingService.remove();
      }).catch(() => {
        this.isLoadingService.remove();
      });
  }

}

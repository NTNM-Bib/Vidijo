import { Component, OnInit, HostListener } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { Router } from '@angular/router';
import { AdminService } from '../admin/shared/admin.service';

@Component({
  selector: 'app-toolbar',
  templateUrl: './toolbar.component.html',
  styleUrls: ['./toolbar.component.scss']
})
export class ToolbarComponent implements OnInit {

  // Buttons to display in the toolbar
  buttons = [
    { name: "Home", route: "/home", icon: "home" },
    { name: "Discover", route: "/discover", icon: "explore" },
    { name: "Journals", route: "/journals", icon: "apps" },
    { name: "Categories", route: "/categories", icon: "label" },
    { name: "Search", route: "/search", icon: "search" },
  ];

  constructor(
    private router: Router,
    private adminService: AdminService
  ) { }


  ngOnInit() {
    this.adminService.adminModeActive.subscribe((active: boolean) => {
      if (active) {
        this.buttons.push({ name: "Users", route: "/users", icon: "person" });
      }
      else {
        this.buttons = [
          { name: "Home", route: "/home", icon: "home" },
          { name: "Discover", route: "/discover", icon: "explore" },
          { name: "Journals", route: "/journals", icon: "apps" },
          { name: "Categories", route: "/categories", icon: "label" },
          { name: "Search", route: "/search", icon: "search" },
        ];
      }
    });
  }


  isActive(button) {
    const pathname: string = button.route;
    return this.router.url.split("?")[0] === pathname.split("?")[0];
  }


  scrollToTopIfNeeded(button) {
    if (this.isActive(button)) {
      window.scroll({ top: 0, left: 0, behavior: "smooth" });
    }
  }

}

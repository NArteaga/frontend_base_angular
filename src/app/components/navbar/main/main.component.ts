import { GlobalService } from '@common/global.service';
import { Component, EventEmitter, Input, OnInit, Output, effect } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';
import { TooltipModule } from 'primeng/tooltip';
import { ThemeService } from '@common/theme.service';
import { BadgeModule } from 'primeng/badge';
import { OverlayPanel, OverlayPanelModule } from 'primeng/overlaypanel';
import { TableModule } from 'primeng/table'
import { Menu, Notify } from '@models/main.model';
import { DividerModule } from 'primeng/divider';
import { Router } from '@angular/router';
import { StorageService } from '@common/storage.service';

@Component({
  selector: 'navbar-main',
  standalone: true,
  imports: [
    ToolbarModule,
    ButtonModule,
    TooltipModule,
    BadgeModule,
    OverlayPanelModule,
    TableModule,
    DividerModule
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class NavbarMainComponent implements OnInit {
  @Input() mediaQuery: string = ''
  @Input() sidebarOpen: boolean = false
  @Input() showSiderbar: boolean = true
  @Input() showNotification: boolean = true
  @Input() showLogout: boolean = true

  @Output() onMenu: EventEmitter<any> = new EventEmitter();
  @Output() onLogout: EventEmitter<any> = new EventEmitter();
  @Output() onLogo: EventEmitter<any> = new EventEmitter();

  theme = 'sun'
  notifiers: Array<Notify> = [];
  selectedProduct?: any
  menus: Array<Menu> = []

  constructor(
    private storageService: StorageService,
    private globalService: GlobalService,
    private themeService: ThemeService,
    private router: Router,
  ) {
    effect(() => {
      const notify = this.globalService.notify()
      if (notify?.type !== 'notify') return
      if (notify?.data?.notifyActive) return
      const select = this.menus.find(item => item.ruta === notify.path)
      this.notifiers.push({ ...notify, type: select?.nombre || '404' })
    }, { allowSignalWrites: true })
  }

  ngOnInit() {
    this.setMenus()
    const theme = this.themeService.getTheme()
    this.theme = theme === 'dark' ? 'moon' : 'sun'
  }

  changeTheme() {
    const theme = this.themeService.setTheme()
    this.theme = theme === 'dark'? 'moon' : 'sun'
  }

  menu() {
    this.sidebarOpen = !this.sidebarOpen
    this.onMenu.emit(this.sidebarOpen)
  }

  logout() {
    this.onLogout.emit()
  }

  logo() {
    this.onLogo.emit()
  }

  actionNotify(notify: Notify, op: OverlayPanel, index: any): void {
    this.notifiers.splice(index, 1)
    notify.data.notifyActive = true
    this.globalService.notify.set({ ...notify })
    this.router.navigate([notify.path])
    op.hide()
  }

  setMenus() {
    const menus = this.storageService.local.getItem('menu')
    const elements: Array<Menu> = []
    if (!menus) { this.menus = elements; return }
    for (const item of menus) {
      if (item.tipo === 'GRUPO_MENU')
        elements.push(...item.childrens)
      if (item.tipo === 'MENU')
        elements.push(item)
    }
    this.menus = elements
  }
}

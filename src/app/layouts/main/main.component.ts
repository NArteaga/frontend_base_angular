import { Component, OnDestroy, OnInit, computed, effect } from '@angular/core';
import { NavbarMainComponent } from '@components/navbar/main/main.component';
import { SidebarComponent } from '@components/sidebar/sidebar.component';
import { CardModule } from 'primeng/card';
import { ThemeService } from '@common/theme.service';
import { MediaQueryService } from '@common/media-query.service';
import { SidebarModule } from 'primeng/sidebar'
import { GlobalService } from '@common/global.service';
import { Menu } from '@models/main.model';
import { Router, RouterOutlet } from '@angular/router';
import { Subscription } from 'rxjs/internal/Subscription';
import { StorageService } from '@common/storage.service';
import { SocketService } from '@common/socket.service';
import { ToastModule } from 'primeng/toast';
import { LoginService } from '@services/login/login.service';
import { MessageService } from 'primeng/api';

@Component({
  selector: 'main-layout',
  standalone: true,
  imports: [
    NavbarMainComponent,
    SidebarComponent,
    CardModule,
    SidebarModule,
    RouterOutlet,
    ToastModule
  ],
  providers: [
    MessageService,
  ],
  templateUrl: './main.component.html',
  styleUrl: './main.component.scss'
})
export class MainLayout implements OnDestroy, OnInit {
  theme = 'light'
  side = false
  openSide = false
  mediaQuery = computed(() => {
    return this.mediaQueryService.mediaQuery()
  })
  selected = computed(() => {
    if (this.globalService.page()) return this.globalService.page()
    return { label: '404', icon: 'pi pi-spin pi-globe' }
  })
  subscribes: Array<Subscription> = []
  socketSubscribes: Record<string, Subscription> = {}
  menus: Array<any> = []
  title: string = ''
  subTitle: string = ''
  timer: any = null
  intentos: number = 0
  permisos: Record<string, { accion: Array<string> }> = {}

  constructor(
    private themeService: ThemeService,
    private globalService: GlobalService,
    private mediaQueryService: MediaQueryService,
    private loginService: LoginService,
    private messageService: MessageService,
    private storage: StorageService,
    private router: Router,
    private socket: SocketService,
  ) {
    const menus = this.storage.local.getItem('menu');
    this.permisos = this.storage.local.getItem('permisos');
    const usuario = this.storage.local.getItem('usuario');
    this.menus = this.mappingMenu(menus)
    this.title = this.nombreCompleto(usuario)
    this.globalService.page.set(this.optionSelect(menus))
    this.subTitle = usuario?.rol?.nombre.toUpperCase()
    this.theme = this.themeService.theme()
    this.subscribes.push(this.receiveNotify('/sync/liquidacion'))
    this.subscribes.push(this.receiveNotify(`/liquidacion/${usuario.id}`))
    this.subscribes.push(this.receiveNotify(`/notify/access`))
    effect(() => {
      for (const row in this.socketSubscribes)
        if (!this.globalService.queueSocket().includes(row)) {
          this.socketSubscribes[row].unsubscribe()
          delete this.socketSubscribes[row]
        }
      for (const row of this.globalService.queueSocket()) {
        if (this.socketSubscribes[row]) continue;
        this.socketSubscribes[row] = this.receiveNotify(row)
      }
    }, { allowSignalWrites: true })
  }


  receiveNotify(channel: string) {
    return this.socket.receive(channel).subscribe(({ title, message, icon, color, type, data }: any) => {
      if (!this.permisos[data.path]) return
      this.globalService.notify.set({
        type,
        color,
        name: title,
        message,
        data,
        icon,
        path: data.path
      })
      if (type === 'notify') {
        this.messageService.clear()
        this.messageService.add({
          severity: color,
          summary: title,
          detail: message,
          icon: icon || 'pi pi-info-circle'
        })
      }
    })
  }

  async ngOnInit() {
    this.timer = setInterval(async () => {
      const { type, error } = await this.loginService.verificar()
      this.intentos++
      if (type === 'error' &&  error.code !== 404)
        await this.logout()
      if (type === 'error' &&  error.code === 404 && this.intentos >= 3)
        await this.logout()
      if (type === 'success') this.intentos = 0
    }, 15000)
  }

  ngOnDestroy(): void {
    this.socket.disconnect()
    clearInterval(this.timer)
    this.subscribes.forEach(sub => sub.unsubscribe())
  }

  home() {
    this.globalService.page.set({ label: 'Inicio', icon: 'pi pi-home' })
    this.router.navigate(['/app/home'])
  }

  toggleSidebar(event: any) {
    this.openSide = true
    this.side = event
    if (!event)
      setTimeout(() => this.openSide = false, 200)
  }

  async logout() {
    await this.globalService.logout()
  }

  nombreCompleto(usuario: any) {
    const nombreCompleto = new Array<string>();
    if (usuario?.nombres) nombreCompleto.push(usuario?.nombres)
    if (usuario?.primerApellido) nombreCompleto.push(usuario?.primerApellido)
    if (usuario?.segundoApellido) nombreCompleto.push(usuario?.segundoApellido)
    return nombreCompleto.join(' ')
  }

  mappingMenu(menus: Array<Menu>, type: string = ''): any {
    return menus?.map((item, index: number) => ({
      key: `${type}${item.tipo}-${index}`,
      tipo: item.tipo,
      label: item.nombre,
      icon: item.icon,
      expanded: true,
      path: item.ruta,
      children: item.childrens ? this.mappingMenu(item.childrens, `${type}${item.tipo}-`) : null,
      styleClass: 'text-[--bg-option] fill-[--bg-option]'
    }))
  }

  optionSelect(menus: Array<Menu>) {
    const elements: Array<Menu> = []
    if (!menus) return { label: '404', icon: 'pi pi-spin pi-globe' }
    for (const item of menus) {
      if (item.tipo === 'GRUPO_MENU')
        elements.push(...item.childrens)
      if (item.tipo === 'MENU')
        elements.push(item)
    }
    const select = elements.find((item) => item.ruta === this.router.url)
    return { label: select?.nombre || '404', icon: select?.icon || 'pi pi-spin pi-globe' }
  }
}

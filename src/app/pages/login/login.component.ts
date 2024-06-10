import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { CardModule } from 'primeng/card';
import { Router } from '@angular/router';
import { LoginService } from '@services/login/login.service';
import { ReCaptchaV3Service } from 'ng-recaptcha';
import { v4 } from 'uuid'
import { ToastModule } from 'primeng/toast';
import { MessageService } from 'primeng/api'
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { PasswordModule } from 'primeng/password';
import { Rule } from '@models/form.model';
import { DividerModule } from 'primeng/divider';
import { StorageService } from '@common/storage.service';
import { lastValueFrom } from 'rxjs/internal/lastValueFrom';

@Component({
  selector: 'login-page',
  standalone: true,
  imports: [
    CardModule,
    ToastModule,
    ReactiveFormsModule,
    ButtonModule,
    InputTextModule,
    PasswordModule,
    DividerModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss',
  providers: [MessageService]
})
export class LoginPage implements OnInit {
  form = new FormGroup({
    usuario: new FormControl(null, [Validators.required]),
    password: new FormControl(null, [Validators.required])
  })

  loading: boolean = false

  rules: {
    usuario: Array<Rule>;
    password: Array<Rule>;
  } = {
    password: [{ type:'required', message: 'El campo es requerido' }],
    usuario: [{ type:'required', message: 'El campo es requerido' }],
  }

  constructor(
    private messageService: MessageService,
    private recaptcha: ReCaptchaV3Service,
    private loginService: LoginService,
    private storage: StorageService,
    private router: Router,
  ) {}

  ngOnInit(): void {
    const token = this.storage.local.getItem('token')
    if (token)
      this.router.navigate(['/app/home'])
  }

  disabled(disable: boolean, form: FormGroup) {
    this.loading = disable
    for (const key in form.controls)
      if (disable) form.get(key)?.disable()
      else form.get(key)?.enable()
  }

  async auth() {
    if (!this.form.valid) return
    this.disabled(true, this.form)
    const secret = v4().replaceAll('-', '')
    const token = await lastValueFrom(this.recaptcha.execute(`auth${secret}time${Date.now()}`))
    if (!token) {
      this.disabled(false, this.form)
      return
    }
    const { result, error, type } = await this.loginService.login(this.form.value, token, secret)
    const response = result || error
    this.disabled(false, this.form)
    if (type === 'error')
      return this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: response.mensaje,
        sticky: false,
      })
    this.loadResponse(response)
    this.router.navigate([`/app/home`])
  }

  loadResponse = (result: any) => {
    result.datos.menus = [
      { icon: 'pi pi-home', nombre: 'Inicio', orden: 0, roles: [{ nombre: result.datos.permisos.nombre }], ruta: '/app/home', tipo: 'MENU' },
      ...result.datos.menus
    ]
    this.storage.local.setItem('menu', result?.datos?.menus)
    const permision: any = {}
    result?.datos?.permisos?.menus.map(((item: { ruta: string, rolMenu: Array<string>}) => {
      permision[item.ruta] = item.rolMenu
    }))
    permision['/app/home'] = ['VER']
    this.storage.local.setItem('permisos', permision)
    this.storage.local.setItem('usuario', result?.datos?.usuario)
  }
}

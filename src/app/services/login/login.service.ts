import { Injectable, inject } from '@angular/core';
import { HttpService } from '@common/http.service';

@Injectable({
  providedIn: 'root'
})
export class LoginService {
  private http = inject(HttpService)
  constructor() { }

  login = async (data: any, token: string, secret: string) => {
    return this.http.executeCrypt({
      method: 'POST',
      url: `/auth/login`,
      headers: {
        'Content-Type': 'application/json',
        'Recaptcha-Token': token
      },
      data: { ...data }
    }, secret)
  }

  verificar = async () => {
    return await this.http.execute({
      method: 'GET',
      url: '/auth/verificar',
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}

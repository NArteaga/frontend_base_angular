import { Injectable, inject, signal } from '@angular/core';
import { Main, Notify } from '@models/main.model';
import { StorageService } from './storage.service';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { HttpService } from './http.service';

@Injectable({
  providedIn: 'root'
})
export class GlobalService {
  page = signal<Main | undefined>(undefined)
  queueSocket = signal<Array<string>>([])
  notify = signal<Notify | undefined>(undefined)
  private storage = inject(StorageService)
  private http = inject(HttpService)
  private router = inject(Router)

  constructor() { }

  addSocket(channel: string) {
    this.queueSocket.set([...this.queueSocket(), channel])
  }

  removeSocket(channel: string) {
    this.queueSocket.set(this.queueSocket().filter(item => item!== channel))
  }

  loading = (form: FormGroup, state: boolean) => {
    for (const key in form.controls)
      if (!state) form.get(key)?.enable()
      else form.get(key)?.disable()
    return { form, state }
  }

  async logout() {
    const theme = this.storage.local.getItem('theme')
    const token = this.storage.local.getItem('token')
    this.storage.local.clear()
    this.storage.session.clear()
    this.storage.local.setItem('theme', theme)
    this.router.navigate(['/auth/login'])
    if (!token) return
    await this.http.execute({
      method: 'GET',
      url: `/auth/logout`,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    })
  }

  formatNumberMonto(number: number) {
    return new Intl.NumberFormat('de-DE').format(number)
  }

  async sleep(seconds: number) {
    return new Promise(resolve => setTimeout(resolve, seconds * 1000))
  }
}


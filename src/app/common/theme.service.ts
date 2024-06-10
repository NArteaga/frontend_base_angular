import { Inject, Injectable, inject, signal } from '@angular/core';
import { StorageService } from '@common/storage.service';
import { DOCUMENT } from '@angular/common';

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private storage = inject(StorageService)
  theme = signal(this.storage.local.getItem('theme') || 'light')

  constructor(
    @Inject(DOCUMENT) private document: Document
  ) {}

  setTheme() {
    let mode = this.storage.local.getItem('theme')
    mode = mode === 'light' ? 'dark' : 'light'
    const theme = this.document.getElementById('app-theme') as HTMLLinkElement
    if (theme) theme.href = `${mode}.css`
    this.theme.set(mode)
    this.storage.local.setItem('theme', mode)
    return mode
  }

  getTheme() {
    const mode = this.storage.local.getItem('theme') || 'light';
    const theme = this.document.getElementById('app-theme') as HTMLLinkElement;
    this.storage.local.setItem('theme', mode)
    if (theme) theme.href = `${mode}.css`
    return mode
  }
}

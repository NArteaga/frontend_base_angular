import { ThemeService } from '@common/theme.service';
import { MediaQueryService } from './common/media-query.service';
import { Component, OnInit, Inject, OnDestroy } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs/internal/Subject';
import { Subscription } from 'rxjs/internal/Subscription';
import { debounceTime, takeUntil } from 'rxjs/operators';
import { MatchMediaQuery } from './constants/global.constant'
import { DOCUMENT } from '@angular/common';
import { RecaptchaV3Module } from 'ng-recaptcha';
import { PrimeNGConfig } from 'primeng/api';
import { fromEvent } from 'rxjs/internal/observable/fromEvent';
@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, RecaptchaV3Module],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit, OnDestroy {
  title = 'SISAT';
  mediaQuery?: string = MatchMediaQuery.md;
  private mediaQueryList?: MediaQueryList;
  private readonly destroy$: Subject<void> = new Subject<void>();
  private subscribes: Array<Subscription> = []

  constructor(
    @Inject(DOCUMENT) private document: Document,
    private mediaQueryService: MediaQueryService,
    private themeService: ThemeService,
    private config: PrimeNGConfig,
  ) {}

  ngOnDestroy(): void {
    this.subscribes.forEach(sub => sub.unsubscribe())
    this.destroy$.next();
    this.destroy$.complete();
  }

  ngOnInit(): void {
    const loading = this.document.getElementById('espera') as HTMLDivElement;
    loading.style.display = 'none';
    this.config.setTranslation({
      dayNames: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
      dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mie', 'Jue', 'Vie', 'Sab'],
      dayNamesMin: ['Do', 'Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa'],
      monthNames: ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'],
      monthNamesShort: ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic']
    })
    this.getMediaQuery()
    const response = this.document.defaultView?.window
    this.themeService.getTheme()
    if (!response) return;

    this.subscribes.push(
      fromEvent(response, 'resize')
        .pipe(takeUntil(this.destroy$), debounceTime(50))
        .subscribe(() => {
          this.getMediaQuery()
        }))
  }

  getMediaQuery() {
    for (const mediaQuery in MatchMediaQuery) {
      const value = MatchMediaQuery[mediaQuery]
      if (!this.document.defaultView?.matchMedia) return;
      this.mediaQueryList = this.document.defaultView?.matchMedia(value)
      if (this.mediaQueryList?.matches) {
        this.mediaQuery = mediaQuery
        this.mediaQueryService.mediaQuery.set(mediaQuery)
        return;
      }
    }
  }
}

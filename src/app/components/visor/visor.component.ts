import { MediaQueryService } from './../../common/media-query.service';
import { GlobalService } from '@common/global.service';
import { FileService } from './../../common/file.service';
import { Component, EventEmitter, Input, OnInit, Output, computed } from '@angular/core';
import { NgxDocViewerModule } from 'ngx-doc-viewer';
import { Document } from '@models/form.model';
import { ButtonModule } from 'primeng/button';
import { MessageService } from 'primeng/api';
import { BlockUIModule } from 'primeng/blockui';
import { TooltipModule } from 'primeng/tooltip';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { PaginatorModule } from 'primeng/paginator';
import { InputNumberModule } from 'primeng/inputnumber';
import { FormControl, ReactiveFormsModule } from '@angular/forms';

@Component({
  selector: 'app-visor',
  standalone: true,
  imports: [
    NgxDocViewerModule,
    ButtonModule,
    BlockUIModule,
    TooltipModule,
    PaginatorModule,
    InputNumberModule,
    ReactiveFormsModule
  ],
  templateUrl: './visor.component.html',
  styleUrl: './visor.component.scss'
})
export class VisorComponent implements OnInit {
  @Input() document!: Document
  @Input() editar: boolean = false
  @Input() html: string | undefined = undefined;

  @Output() close: EventEmitter<any> = new EventEmitter();
  @Output() generar: EventEmitter<any> = new EventEmitter();

  render: any
  loading: boolean = false
  error: boolean = false
  mistake: boolean = false
  mediaQuery = computed(() => {
    return this.mediaQueryService.mediaQuery()
  })

  zoom = new FormControl<number>(83.5)

  editor = {
    totalPages: 0,
    page: 0,
    pages: new Array<SafeHtml>(),
    nodePages: new Array<HTMLDivElement>()
  }
  constructor(
    private mediaQueryService: MediaQueryService,
    private messageService: MessageService,
    private globalService: GlobalService,
    private fileService: FileService,
    private sanitizer: DomSanitizer
  ) {}

  async ngOnInit() {
    if (['xs', 'sm'].includes(this.mediaQuery())) {
      try {
        const file = await this.fileService.urlToFile(this.document.path, this.document.name)
        const link = document.createElement('a')
        link.download = this.document.name
        link.href = URL.createObjectURL(file)
        link.click()
        this.close.emit()
        return
      } catch (error) {
        this.messageService.add({
          severity: 'error',
          summary: 'Error',
          detail: 'Existió un error al intentar recuperar el documento',
        })
        this.close.emit()
        return
      }
    }
    this.error = false
    if (this.document.type !== 'pdf') return
    await this.loadPdf()
  }

  async loadPdf() {
    try {
      this.loading = true;
      const file = await this.fileService.urlToFile(this.document.path, this.document.name)
      this.render = URL.createObjectURL(file)
    } catch (error) {
      this.messageService.add({
        severity: 'error',
        summary: 'Error',
        detail: 'Existió un error al intentar recuperar el documento',
      })
      this.error = true
    } finally {
      await this.globalService.sleep(2)
      this.loading = false
    }
  }

  isType(type: string){
    if (this.document.type === 'pdf') return type === 'pdf'
    if (this.document.mime.startsWith('image/')) return type === 'image'
    return !['pdf', 'image'].includes(type)
  }

  modoEditable() {
    if (!this.html) return
    this.editor.pages = new Array<SafeHtml>()
    this.editor.nodePages = new Array<HTMLDivElement>()
    const div = document.createElement('div') as HTMLDivElement
    div.innerHTML = this.html
    const pages = div.getElementsByClassName('page')
    this.editor.totalPages = pages.length
    for (let i = 0; i < pages.length; i++) {
      const page = pages.item(i) as HTMLDivElement
      this.editor.nodePages.push(page)
      page.style.height = '1000px'
      page.style.width = '100%'
      this.editor.pages.push(this.sanitizer.bypassSecurityTrustHtml(page.outerHTML || ''))
    }
    this.editor.page = 0
    this.mistake = true
  }

  download() {
    const link = document.createElement('a')
    link.download = this.document?.name || ''
    link.href = this.document?.path || ''
    link.target = "_blank";
    link.click()
  }

  save(divEditor: HTMLDivElement) {
    if (!this.html) return
    this.editor.pages[this.editor.page] = this.sanitizer.bypassSecurityTrustHtml(divEditor.innerHTML)
    this.editor.nodePages[this.editor.page].innerHTML = (divEditor.childNodes.item(0) as HTMLDivElement).innerHTML
    const html = document.createElement('html') as HTMLHtmlElement
    const body = document.createElement('body') as HTMLBodyElement
    body.classList.add('html')
    const header = document.createElement('header')
    header.innerText = '*style*'
    for (const page of this.editor.nodePages) {
      page.removeAttribute('style')
      body.appendChild(page)
    }
    html.appendChild(header)
    html.appendChild(body)
    this.mistake = false
    this.error = false
    this.loading = true
    this.generar.emit(html.outerHTML)
  }

  onPageChange(event: any, divEditor: HTMLDivElement) {
    this.editor.pages[this.editor.page] = this.sanitizer.bypassSecurityTrustHtml(divEditor.innerHTML)
    this.editor.nodePages[this.editor.page].innerHTML = (divEditor.childNodes.item(0) as HTMLDivElement).innerHTML
    this.editor.page = event.page
  }

  getZoom() {
    if (!this.zoom.value) return 0
    return this.zoom.value / 100
  }
}

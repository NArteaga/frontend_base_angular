import { CommonModule } from '@angular/common';
import { Component, ElementRef, EventEmitter, Input, OnInit, Output, Signal, TemplateRef, ViewChild, computed } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { DividerModule } from 'primeng/divider';
import { Table, TableModule } from 'primeng/table';
import { Filter, Column, Option } from '@models/crud.model'
import { RadioButtonModule } from 'primeng/radiobutton';
import { TieredMenuModule } from 'primeng/tieredmenu'
import { RowSelect } from '@constants/global.constant';
import { MediaQueryService } from '@common/media-query.service';
import { FilterComponent } from '@components/filter/filter.component';
import { PaginationComponent } from '@components/pagination/pagination.component';
import dayjs from 'dayjs';
import { FormsModule } from '@angular/forms';
import { MenuItem } from 'primeng/api';

@Component({
  selector: 'crudtable-component',
  standalone: true,
  imports: [
    ButtonModule,
    TieredMenuModule,
    FilterComponent,
    PaginationComponent,
    TableModule,
    CardModule,
    DividerModule,
    RadioButtonModule,
    CommonModule,
    FormsModule
  ],
  templateUrl: './crudtable.component.html',
  styleUrl: './crudtable.component.scss'
})
export class CrudtableComponent implements OnInit {
  @ViewChild(PaginationComponent) pagination!: PaginationComponent

  @Input() content!: TemplateRef<ElementRef>
  @Input() item!: TemplateRef<ElementRef>
  @Input() buttons!: TemplateRef<ElementRef>
  @Input() action!: TemplateRef<ElementRef>
  @Input() filters: Array<Filter<any, any>> | undefined;
  @Input() columns?: Array<Column> = []
  @Input() rows?: Array<Option<number, number>> = RowSelect;
  @Input() items: Array<any> = []
  @Input() viewAdd: boolean = true;
  @Input() readonly?: boolean = false
  @Input() rowEvent?: boolean = false
  @Input() styleClassRow: string = ''
  @Input() styleClassActionTable: string = 'w-14'
  @Input() styleClassSelectRow: string = ''
  @Input() total: number = 0;

  @Output() change: EventEmitter<any> = new EventEmitter()
  @Output() refresh: EventEmitter<any> = new EventEmitter()
  @Output() add: EventEmitter<any> = new EventEmitter()
  @Output() onRow: EventEmitter<any> = new EventEmitter()
  order = ''
  informacion: {
    open: { filter: boolean },
    control: { rows: number, page: number, order?: string },
    mediaQuery: Signal<string>,
    filter: any,
    sort: MenuItem[],
    loading: boolean
  } = {
    open: { filter: false },
    control: { rows: 10, page: 0 },
    mediaQuery: computed(() => {
      return this.mediaQueryService.mediaQuery()
    }),
    filter: {},
    sort: [],
    loading: false,
  }
  orders: any[] = [
    { icon: 'pi pi-sort-amount-up-alt', operator: '' },
    { icon: 'pi pi-sort-amount-down', operator: '-' },
  ];
  constructor(
    private mediaQueryService: MediaQueryService
  ) {}

  ngOnInit(): void {
    this.getFilter()
    this.getSorted()
  }

  getFilter() {
    if (!this.filters) return
    for (const filter of this.filters) {
      if (!filter.defaultValue) continue
      if (filter.type === 'calendar') {
        this.informacion.filter[filter.control] = dayjs(filter.defaultValue).format('DD/MM/YYYY')
        continue
      }
      this.informacion.filter[filter.control] = filter.defaultValue
    }
  }

  getSorted() {
    if (!this.columns) return
    const sorted: MenuItem[] = []
    for (const column of this.columns)
      if (column.sort)
        sorted.push({
          label: column.label,
          icon: 'pi pi-sort-alt',
          id: column.sortLabel || '',
          command: () => this.allGlobalSort(column.sortLabel || ''),
        })
    this.informacion.sort = sorted
  }

  allGlobalSort(value: string) {
    if (`-${value}` === this.order) return this.eventSortChange(`-${value}`)
    if (value === this.order) return this.eventSortChange(`-${value}`)
    return this.eventSortChange(value)
  }

  sorterEvent(label: string, event: any) {
    if (event) event.stopPropagation()
    this.eventSortChange(label)
  }

  eventSortChange(value: string) {
    let order: string | undefined = value
    if (this.order === value) order = undefined
    this.order = order || ''
    this.informacion.control.order = order
    this.change.emit({ control: this.informacion.control, filter: this.informacion.filter })
  }

  reset() {
    this.pagination.reset({ value: this.informacion.control.rows })
  }

  eventFilter(value: any) {
    this.informacion.filter = value
    this.reset()
  }

  eventSort(value: any, table: Table) {
    let order: string | undefined
    if (value.order === -1) order = `-${value.field}`
    else order = `${value.field}`
    if (order === this.informacion.control.order) return
    if (order === this.order) {
      order = undefined
      this.order = ''
      table.reset()
    } else this.order = `${value.field}`
    this.informacion.control.order = order
    this.change.emit({ control: this.informacion.control, filter: this.informacion.filter })
  }

  eventRefresh() {
    this.informacion.loading = true
    if (!this.informacion.control) return
    this.refresh.emit({ control: this.informacion.control, filter: this.informacion.filter })
    this.informacion.loading = false
  }

  addRegister() { this.add.emit() }

  page(event: any) {
    if (!event) return
    this.informacion.control.page = event.page
    this.informacion.control.rows = event.rows
    this.change.emit({ control: this.informacion.control, filter: this.informacion.filter })
  }

  context(implicit: any, other: any) {
    return {
      '$implicit': implicit,
      ...other
    }
  }

  onRowEvent(item: any, index: number) {
    if (this.rowEvent) this.onRow.emit({ item, index })
  }

  validarOrder() {
    if (!this.columns) return false
    for (const column of this.columns)
      if (column.sort) return true
    return false
  }

  getOrder() {
    if (!this.order) return ''
    const order = this.columns?.find(column => column.sortLabel === this.order || `-${column.sortLabel}` === this.order)
    if (!order) return ''
    if (this.order.startsWith('-')) return `${order.label}, en forma descendente`
    return `${order.label}, en forma ascendente`
  }
}

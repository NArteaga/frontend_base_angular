import { Component, EventEmitter, Input, OnChanges, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { Filter } from '@models/crud.model';
import { CalendarModule } from 'primeng/calendar';
import { ChipsModule } from 'primeng/chips';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';
import dayjs from 'dayjs';
import { ButtonModule } from 'primeng/button';
import { BlockUIModule } from 'primeng/blockui';
import { CardModule } from 'primeng/card';
import { GlobalService } from '@common/global.service';
import { InplaceModule } from 'primeng/inplace';
import { KnobModule } from 'primeng/knob';

@Component({
  selector: 'app-sync',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    InputNumberModule,
    InputTextModule,
    DropdownModule,
    CalendarModule,
    InplaceModule,
    BlockUIModule,
    ButtonModule,
    ChipsModule,
    CardModule,
    KnobModule,
    FormsModule
  ],
  templateUrl: './sync.component.html',
  styleUrl: './sync.component.scss'
})
export class SyncComponent implements OnChanges, OnInit {
  @Input() inputs: Array<Filter<any, any>> | undefined;
  @Input() loading: boolean = false;
  @Input() message: string = 'Cargando...';
  @Input() porcentage: number = 0

  @Output() onSync: EventEmitter<any> = new EventEmitter()

  form: FormGroup = new FormGroup<any>({});

  maxDefault = dayjs().add(100, 'year').toDate()
  minDefault = dayjs().add(-100, 'year').toDate()

  constructor(
    private global: GlobalService,
  ) {}

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['loading'])
      this.global.loading(this.form, changes['loading'].currentValue)
  }

  ngOnInit(): void {
    if (!this.inputs) return
    const form: any = {}
    for (const { control, defaultValue, rules } of this.inputs)
      form[control] = new FormControl({ value: defaultValue, disabled: false }, this.setRules(rules))
    this.form = new FormGroup(form)
  }

  setRules(rules: Array<{ validator: Validators }> | undefined) {
    const newRules: any = []
    if  (!rules) return newRules
    for (const rule of rules)
      newRules.push(rule.validator)
    return newRules
  }

  maxDateControl(date: any) {
    if (isNaN(Date.parse(date)))
      return this.form.value[date] || this.maxDefault
    return date || this.maxDefault
  }

  minDateControl(date: any) {
    if (isNaN(Date.parse(date)))
      return this.form.value[date] || this.minDefault
    return date || this.minDefault
  }

  clSync(): void {
    if (!this.form.valid) return
    const input: any = {}
    for (const key in this.form.value) {
      const property = this.getProperty(key)
      if (this.form.value[key])
        input[key] = this.form.value[key]
      if (input[key] && property?.type === 'calendar' && dayjs(input[key]).isValid()) {
        let date = dayjs(input[key])
        if (property.calendar?.default === 'last') date = date.endOf(property.calendar?.view || 'day')
        if (property.calendar?.default === 'first') date = date.startOf(property.calendar?.view || 'day')
        input[key] = date.format('DD/MM/YYYY')
      }
    }
    this.global.loading(this.form, this.loading)
    this.onSync.emit(input)
  }

  getProperty(filter: string) {
    return this.inputs?.find(item => item.control === filter)
  }

  addNuevaPalabraClave(event: any) {
    if (!Array.isArray(this.form.value.palabraClave)) return
    const contenido = [...this.form.value.palabraClave]
    contenido.splice(-1, 1)
    const nuevaPalabra = event.value.toUpperCase()
    this.form.patchValue({ palabraClave: [...contenido, nuevaPalabra] })
  }
}

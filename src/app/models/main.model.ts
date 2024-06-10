export interface Main {
  label: string;
  icon: string;
}

export interface Notify {
  data?: any;
  filters?: any;
  name: string;
  message: string;
  type: string;
  icon: string;
  color: string;
  path: string;
}

export interface Menu {
  nombre: string,
  icon: string,
  childrens: Array<Menu>,
  tipo: string,
  ruta?: string
}

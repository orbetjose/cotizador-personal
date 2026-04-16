export type Cotizaciones = {
  id: string;
  cliente: string;
  razon_social: string;
  tipo_documento: string;
  documento_fiscal: string;
  telefono: string;
  correo: string;
  tipo_servicio: string;
  descripcion_servicio: string;
  tareas_servicio: string[];
  tecnologias_servicio: string[];
  total: number;
  created_at: string;
  numero_cotizacion: string;
}[];

export type Cotizacion = {
  id: string;
  cliente: string;
  razon_social: string;
  tipo_documento: string;
  documento_fiscal: string;
  telefono: string;
  correo: string;
  tipo_servicio: string;
  descripcion_servicio: string;
  tareas_servicio: string[];
  tecnologias_servicio: string[];
  total: number;
  created_at: string;
  numero_cotizacion: string;
};




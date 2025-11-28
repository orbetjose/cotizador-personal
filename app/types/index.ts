export type CotizacionPDFProps = {
  numero_cotizacion: string;
  razon_social: string;
  tipo_documento: string;
  documento_fiscal: string;
  cliente: string;
  correo: string;
  telefono: string;
  created_at: Date;
  total: string;
  descripcion_servicio: string;
  tareas_servicio: string[];
  tecnologias_servicio: string[];
};
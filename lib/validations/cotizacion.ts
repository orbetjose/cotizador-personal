import { z } from "zod";

export const cotizacionSchema = z.object({
  razonSocial: z.string().optional(),
  tipoDocumento: z.enum(["RUC", "NIT", "NO_APLICA"]).optional(),
  documentoFiscal: z.string().optional(),
  cliente: z.string().min(2, {
    message: "El nombre del cliente debe tener al menos 2 caracteres.",
  }),
  telefono: z
    .string()
    .min(6, {
      message: "El teléfono debe tener al menos 6 dígitos.",
    })
    .max(15, {
      message: "El teléfono no puede tener más de 15 dígitos.",
    }),
  correo: z.email().optional().or(z.literal("")),
  tipoServicio: z.enum(["DESARROLLO_WEB", "ASESORIA_TECNICA", "SOPORTE_WEB", "DESARROLLO_HTML"]).optional(),
  descripcionServicio: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  tasks: z.array(z.string().min(1, "La tarea no puede estar vacía").trim()),
  techs: z.array(z.string().min(1, "Las tecnologías no pueden estar vacías").trim()),
  total: z.string({
    message: "El total debe ser un número mayor a 0.",
  }),
});

export type CotizacionFormData = z. infer<typeof cotizacionSchema>;

// ✅ Tipo para la respuesta de la DB
export type Cotizacion = {
  id: string;
  user_id: string;
  razon_social: string;
  tipo_documento: string | null;
  documento_fiscal: string | null;
  cliente: string;
  telefono: string | null;
  correo: string | null;
  tipo_servicio: string;
  descripcion_servicio: string | null;
  tareas_servicio: string[] | null;
  tecnologias_servicio: string[] | null;
  total: number;
  created_at: string;
  updated_at: string;
};
"use server";

import { createClient } from "@/lib/server";
import { cotizacionSchema, type CotizacionFormData, type Cotizacion } from "@/lib/validations/cotizacion";

type ActionResponse<T> = { success: true; data: T } | { success: false; error: string };

export async function createCotizacion(formData: CotizacionFormData): Promise<ActionResponse<Cotizacion>> {
  try {
    const validatedData = cotizacionSchema.parse(formData);
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      throw new Error("Usuario no autenticado");
    }
    const { data, error: insertError } = await supabase
      .from("cotizaciones")
      .insert([
        {
          user_id: user.id,
          razon_social: validatedData.razonSocial,
          tipo_documento: validatedData.tipoDocumento || null,
          documento_fiscal: validatedData.documentoFiscal || null,
          cliente: validatedData.cliente,
          telefono: validatedData.telefono || null,
          correo: validatedData.correo || null,
          tipo_servicio: validatedData.tipoServicio,
          descripcion_servicio: validatedData.descripcionServicio || null,
          tareas_servicio: validatedData.tasks,
          tecnologias_servicio: validatedData.techs,
          total: validatedData.total,
        },
      ])
      .select()
      .single();
    if (insertError) {
      console.error("Error al insertar cotización:", insertError);
      return {
        success: false,
        error: `Error al crear la cotización: ${insertError.message}`,
      };
    }

    return {
      success: true,
      data: data as Cotizacion,
    };
  } catch (error) {
    console.error("Error en createCotizacion:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function updateCotizacion(id: string, formData: CotizacionFormData): Promise<ActionResponse<Cotizacion>> {
  try {
    const validatedData = cotizacionSchema.parse(formData);
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    const { data: existing, error: fetchError } = await supabase
      .from("cotizaciones")
      .select("id, user_id")
      .eq("id", id)
      .single();

    if (fetchError || !existing) {
      return {
        success: false,
        error: "Cotización no encontrada",
      };
    }

    if (existing.user_id !== user.id) {
      return {
        success: false,
        error: "No tienes permiso para editar esta cotización",
      };
    }

    const { data, error: updateError } = await supabase
      .from("cotizaciones")
      .update({
        razon_social: validatedData.razonSocial,
        tipo_documento: validatedData.tipoDocumento || null,
        documento_fiscal: validatedData.documentoFiscal || null,
        cliente: validatedData.cliente,
        telefono: validatedData.telefono || null,
        correo: validatedData.correo || null,
        tipo_servicio: validatedData.tipoServicio,
        descripcion_servicio: validatedData.descripcionServicio || null,
        tareas_servicio: validatedData.tasks,
        tecnologias_servicio: validatedData.techs,
        total: validatedData.total,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select()
      .single();

    if (updateError) {
      console.error("Error al actualizar cotización:", updateError);
      return {
        success: false,
        error: `Error al actualizar la cotización: ${updateError.message}`,
      };
    }

    return {
      success: true,
      data: data as Cotizacion,
    };
  } catch (error) {
    console.error("Error en updateCotizacion:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

export async function deleteCotizacion(id: string): Promise<ActionResponse<{ id: string }>> {
  try {
    const supabase = await createClient();

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return {
        success: false,
        error: "Usuario no autenticado",
      };
    }

    // Eliminar (solo si pertenece al usuario)
    const { error: deleteError } = await supabase.from("cotizaciones").delete().eq("id", id).eq("user_id", user.id);

    if (deleteError) {
      return {
        success: false,
        error: `Error al eliminar: ${deleteError.message}`,
      };
    }
    return {
      success: true,
      data: { id },
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : "Error desconocido",
    };
  }
}

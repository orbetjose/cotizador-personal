import { createClient } from "@/lib/server";
import { CotizacionForm } from "@/components/cotizacion-form";
import { Cotizacion } from "@/lib/index";

interface Props {
  params: Promise<{ id: string }>; // ✅ params es una Promise
}

async function fetchCotizacion(id: string) {
  const supabase = await createClient();
  const { data, error } = await supabase.from("cotizaciones").select().eq("id", id).single();

  if (error) {
    throw new Error(`Error al obtener la cotización: ${error.message}`);
  }
  return data;
}

export default async function EditarCotizacionPage({ params }: Props) {
  const { id } = await params;
  const cotizacionData: Cotizacion = await fetchCotizacion(id);
  return (
    <div className="container mx-auto py-8 px-4">
      <CotizacionForm
        mode="edit"
        cotizacionId={id}
        initialData={cotizacionData}
      />
    </div>
  );
}


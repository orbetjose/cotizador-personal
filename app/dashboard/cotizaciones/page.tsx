import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function CotizacionesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold">Mis Cotizaciones</h2>
          <p className="text-muted-foreground">
            Lista de todas las cotizaciones creadas
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/cotizaciones/nueva">
            Nueva Cotización
          </Link>
        </Button>
      </div>
      
      {/* Aquí irá la lista de cotizaciones después */}
      <div className="bg-white p-6 rounded-lg border">
        <p className="text-center text-muted-foreground">
          No hay cotizaciones aún. ¡Crea tu primera cotización!
        </p>
      </div>
    </div>
  )
}
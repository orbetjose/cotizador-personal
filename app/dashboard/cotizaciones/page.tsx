"use client";

import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCaption, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { Cotizaciones } from "@/lib";
import { useRouter, useSearchParams } from "next/navigation";
import { Printer, SquarePen } from "lucide-react";
import { toast } from "sonner";
import DeleteCotizacion from "@/components/action-delete";
import { Input } from "@/components/ui/input";
import { DatePickerInput } from "@/components/ui/datepickerinput";
import { Label } from "@/components/ui/label";

export default function CotizacionesPage() {
  const [isLoading, setIsLoading] = useState(true); // Empezar con true
  const [error, setError] = useState<string | null>(null);
  const [cotizaciones, setCotizaciones] = useState<Cotizaciones>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");

  const router = useRouter();
  const searchParams = useSearchParams();
  const refresh = searchParams.get("refresh");

  const getCotizaciones = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const supabase = createClient();

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw new Error("Usuario no autenticado");
      }

      const { data, error } = await supabase
        .from("cotizaciones")
        .select()
        .order("created_at", { ascending: false })
        .limit(10);

      if (error) {
        throw new Error(`Error al obtener las cotizaciones: ${error.message}`);
      }

      setCotizaciones(data);
    } catch (error: unknown) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const searchCotizaciones = async (query: string) => {
    try {
      setIsLoading(true);
      setError(null);
      const supabase = createClient();
      const { data, error } = await supabase
        .from("cotizaciones")
        .select()
        .ilike("numero_cotizacion", `%${query}%`)
        .order("created_at", { ascending: false });

      if (error) {
        throw new Error(`Error al obtener las cotizaciones desde el buscador: ${error.message}`);
      }
      setCotizaciones(data);
    } catch (error: unknown) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCotizaciones();

    if (refresh) {
      router.replace("/dashboard/cotizaciones", { scroll: false });
    }
  }, [refresh]);

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    const { error } = await supabase.from("cotizaciones").delete().eq("id", id);
    toast.success("¡Cotización eliminada exitosamente!", {
      duration: 5000,
    });
    if (error) {
      console.error("Error al eliminar la cotización:", error.message);
      setError(`Error al eliminar la cotización: ${error.message}`);
    } else {
      getCotizaciones();
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const searchTerm = e.target.value;
    setSearchTerm(searchTerm);
    searchCotizaciones(searchTerm);
  };

  console.log(searchTerm);

  return (
    <>
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">Mis Cotizaciones</h2>
            <p className="text-muted-foreground">Lista de todas las cotizaciones creadas</p>
          </div>
          <Button asChild>
            <Link href="/dashboard/cotizaciones/nueva">Nueva Cotización</Link>
          </Button>
        </div>

        {/* Manejo de estados */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-red-700 font-medium">Error:</p>
            <p className="text-red-600">{error}</p>
            <Button
              variant="outline"
              size="sm"
              className="mt-2"
              onClick={getCotizaciones}>
              Reintentar
            </Button>
          </div>
        )}

        {isLoading ? (
          <div className="bg-white p-8 rounded-lg border">
            <div className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
              <span className="ml-3 text-muted-foreground">Cargando cotizaciones...</span>
            </div>
          </div>
        ) : cotizaciones.length === 0 ? (
          <div className="bg-white p-6 rounded-lg border">
            <p className="text-center text-muted-foreground">No hay cotizaciones aún. ¡Crea tu primera cotización!</p>
          </div>
        ) : (
          <div>
            <div className="my-4 flex items-end justify-between">
              <div className="flex-1 flex gap-1 flex-col">
                <Label
                  htmlFor="buscador"
                  className="px-1">
                  Buscar cotizaciones
                </Label>
                <Input
                  name="buscador"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  className="bg-white"
                  placeholder="COT-2025-0001..."
                />
              </div>
              <div className="flex-1 flex gap-4 justify-center">
                <DatePickerInput />
                <DatePickerInput />
              </div>
            </div>
            <Table>
              <TableCaption>Lista de tus cotizaciones recientes.</TableCaption>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Descripción servicio</TableHead>
                  <TableHead>Fecha de creación</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead
                    colSpan={3}
                    className="text-center">
                    Acciones
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cotizaciones.map((cotizacion) => (
                  <TableRow key={cotizacion.id}>
                    <TableCell className="">{cotizacion.numero_cotizacion}</TableCell>
                    <TableCell className="">{cotizacion.cliente}</TableCell>
                    <TableCell className="">{cotizacion.telefono}</TableCell>
                    <TableCell className=""></TableCell>
                    <TableCell className="">{new Date(cotizacion.created_at).toLocaleDateString()}</TableCell>
                    <TableCell className="font-medium">S/ {cotizacion.total}</TableCell>
                    <TableCell className="font-medium ">
                      <div className="flex justify-center gap-2">
                        <button className="cursor-pointer">
                          <Link href={`/dashboard/cotizaciones/imprimir/${cotizacion.id}`}>
                            <Printer width={20} />
                          </Link>
                        </button>
                        <button className="cursor-pointer">
                          <SquarePen width={20} />
                        </button>
                        <DeleteCotizacion
                          id={cotizacion.id}
                          onDelete={handleDelete}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </>
  );
}

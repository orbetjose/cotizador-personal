"use client";

import { createClient } from "@/lib/client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation"; // ← Asegúrate que sea de 'next/navigation'
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MoneyInput } from "@/components/moneyinput";
import { toast } from "sonner";

const formSchema = z.object({
  razonSocial: z.string().min(2, {
    message: "La razón social debe tener al menos 2 caracteres.",
  }),
  tipoDocumento: z.enum(["RUC", "NIT", "NO_APLICA"]).optional(),
  documentoFiscal: z.string().regex(/^\d{11}$/, {
    message: "El RUC debe tener exactamente 11 dígitos.",
  }),
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
  correo: z.email({
    message: "Debe ser un email válido.",
  }),
  descripcionServicio: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  detallesServicio: z.string().min(20, {
    message: "Los detalles deben tener al menos 20 caracteres.",
  }),
  total: z.string({
    message: "El total debe ser un número mayor a 0.",
  }),
});

export function CotizacionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      razonSocial: "",
      tipoDocumento: "RUC",
      documentoFiscal: "",
      cliente: "",
      telefono: "",
      correo: "",
      descripcionServicio: "",
      detallesServicio: "",
      total: "",
    },
  });

  const tipoDocumento = form.watch("tipoDocumento");

  useEffect(() => {
    if (tipoDocumento === "NO_APLICA") {
      form.setValue("documentoFiscal", "");
    }
  }, [tipoDocumento, form]);

  const validateDocumento = (value: string | undefined) => {
    if (!value || !tipoDocumento || tipoDocumento === "NO_APLICA") {
      return true;
    }

    switch (tipoDocumento) {
      case "RUC":
        return /^\d{11}$/.test(value) || "RUC debe tener 11 dígitos";
      case "NIT":
        return /^\d{9,10}$/.test(value) || "NIT debe tener 9-10 dígitos";
      default:
        return true;
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsLoading(true);
    setError(null);
    const supabase = createClient();

    try {
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
            user_id: user?.id,
            razon_social: values.razonSocial,
            tipo_documento: values.tipoDocumento,
            documento_fiscal: values.documentoFiscal,
            cliente: values.cliente,
            telefono: values.telefono,
            correo: values.correo,
            descripcion_servicio: values.descripcionServicio,
            detalles_servicio: values.detallesServicio,
            total: values.total,
          },
        ])
        .select();
      if (insertError) {
        throw new Error(`Error al guardar: ${insertError.message}`);
      }

      // 3. Éxito
      form.reset();
      toast.success("¡Cotización creada exitosamente!", {
        description: `Número: ${data[0].numero_cotizacion}`,
        duration: 5000,
      });
    } catch (error: unknown) {
      console.error("Error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error desconocido";
      setError(errorMessage);
    } finally {
      setIsLoading(false); // ← Solo una vez aquí
    }
  };

  return (
    <Card className="w-full max-w-4xl mx-auto">
      <CardHeader>
        <CardTitle>Nueva Cotización</CardTitle>
        <CardDescription>Completa todos los campos para crear una nueva cotización.</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6">
            {/* Información de la empresa */}
            <div className="space-y-4">
              <h3 className="text-lg font-medium">Información de la Empresa</h3>

              <FormField
                control={form.control}
                name="razonSocial"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Razón Social</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Mi Empresa S.A.C."
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex gap-4">
                <FormField
                  control={form.control}
                  name="tipoDocumento"
                  render={({ field }) => (
                    <FormItem className="">
                      <FormLabel>Tipo de documento</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="w-60">
                            <SelectValue placeholder="Selecciona un tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectGroup>
                            <SelectItem value="RUC">RUC (Perú)</SelectItem>
                            <SelectItem value="NIT">NIT (Colombia)</SelectItem>
                            <SelectItem value="NO_APLICA">No aplica</SelectItem>
                          </SelectGroup>
                        </SelectContent>
                      </Select>
                      <FormDescription>Opcional - Solo si es empresa o negocio</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo condicional para documento fiscal */}
                {tipoDocumento && tipoDocumento !== "NO_APLICA" && (
                  <FormField
                    control={form.control}
                    name="documentoFiscal"
                    rules={{ validate: validateDocumento }}
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>{tipoDocumento === "RUC" ? "RUC" : "NIT"}</FormLabel>
                        <FormControl>
                          <Input
                            placeholder={tipoDocumento === "RUC" ? "12345678901" : "123456789"}
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          {tipoDocumento === "RUC" ? "Debe tener 11 dígitos" : "Debe tener 9-10 dígitos"}
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Información del cliente */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="cliente"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cliente</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Nombre del cliente"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="telefono"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="999123456"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="correo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="cliente@empresa.com"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Información del servicio */}
            <FormField
              control={form.control}
              name="descripcionServicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción del Servicio</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Desarrollo web, consultoría, etc."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Una descripción breve del servicio a cotizar</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="detallesServicio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Detalles del Servicio</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Describe detalladamente el servicio, alcances, metodología, entregables, tiempos, etc."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Incluye todos los detalles relevantes del servicio</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="total"
              render={({ field }) => (
                <FormItem className="max-w-xs">
                  <FormLabel>Total (S/)</FormLabel>
                  <FormControl>
                    <MoneyInput
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormDescription>Monto total en soles peruanos</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-4">
              <Button
                type="submit"
                disabled={isLoading}>
                {isLoading ? "Guardando..." : "Crear Cotización"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => form.reset()}>
                Limpiar
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}

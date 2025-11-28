"use client";

import { createClient } from "@/lib/client";
import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useRouter } from "next/navigation";
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
import { Plus, X } from "lucide-react";

const formSchema = z.object({
  razonSocial: z.string().min(2, {
    message: "La razón social debe tener al menos 2 caracteres.",
  }),
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
  descripcionServicio: z.string().min(10, {
    message: "La descripción debe tener al menos 10 caracteres.",
  }),
  tasks: z.array(z.string().min(1, "La tarea no puede estar vacía").trim()),
  techs: z.array(z.string().min(1, "Las tecnologías no pueden estar vacías").trim()),
  total: z.string({
    message: "El total debe ser un número mayor a 0.",
  }),
});

export function CotizacionForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [servicesTasks, setServicesTasks] = useState("");
  const [techUsage, setTechUsage] = useState("");
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
      tasks: [],
      techs: [],
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

  const addDetail = (detail: string, inputName: "tasks" | "techs") => {
    if (detail.trim().length < 1) {
      toast.error("La tarea debe tener al menos 1 caracter.");
      return;
    }

    const currentTareas = form.getValues(inputName);
    form.setValue(inputName, [...currentTareas, detail.trim()]);
    setServicesTasks("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, detail: string, inputName: "tasks" | "techs") => {
    if (e.key === "Enter") {
      e.preventDefault();
      addDetail(detail, inputName);
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
            tareas_servicio: values.tasks,
            tecnologias_servicio: values.techs,
            total: values.total,
          },
        ])
        .select();
      if (insertError) {
        throw new Error(`Error al guardar: ${insertError.message}`);
      }

      // 3. Éxito
      toast.success("¡Cotización creada exitosamente!", {
        description: `Número: ${data[0].numero_cotizacion}`,
        duration: 5000,
      });
      form.reset();
      router.push("/dashboard/cotizaciones?refresh=true");
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
                        required={false}
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
                    <Textarea
                      placeholder="Desarrollo web, consultoría, etc."
                      className="min-h-[120px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>Una descripción breve del servicio a cotizar</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <FormLabel>Tareas que se van a realizar</FormLabel>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  className="cursor-pointer"
                  onClick={() => addDetail(servicesTasks, "tasks")}>
                  <Plus />
                </Button>

                <Input
                  placeholder="Agregar tarea..."
                  value={servicesTasks}
                  onChange={(e) => setServicesTasks(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, servicesTasks, "tasks")}
                />
              </div>
            </div>
            {/* Lista de tareas agregadas */}
            <div className="space-y-2 mt-4">
              {form.watch("tasks")?.map((tarea, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted px-3 py-1 rounded">
                  <span className="text-sm font-medium">{tarea}</span>
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const tareas = form.getValues("tasks");
                      form.setValue(
                        "tasks",
                        tareas.filter((_, i) => i !== index)
                      );
                    }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>
            <div className="space-y-2">
              <FormLabel>Tecnologías a usar</FormLabel>
              <div className="flex gap-4">
                <Button
                  variant="outline"
                  size="icon"
                  type="button"
                  className="cursor-pointer"
                  onClick={() => addDetail(techUsage, "techs")}>
                  <Plus />
                </Button>

                <Input
                  placeholder="Agregar tarea..."
                  value={techUsage}
                  onChange={(e) => setTechUsage(e.target.value)}
                  onKeyDown={(e) => handleKeyDown(e, techUsage, "techs")}
                />
              </div>
            </div>

            {/* Lista de techs agregadas */}
            <div className="space-y-2 mt-4">
              {form.watch("techs")?.map((tarea, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between bg-muted px-3 py-1 rounded">
                  <span className="text-sm font-medium">{tarea}</span>
                  <Button
                    className="cursor-pointer"
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      const tareas = form.getValues("techs");
                      form.setValue(
                        "techs",
                        tareas.filter((_, i) => i !== index)
                      );
                    }}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            </div>

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
                className="cursor-pointer"
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

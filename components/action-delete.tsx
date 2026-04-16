import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Trash } from "lucide-react";
import { deleteCotizacion } from "@/app/actions/cotizaciones";
import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

interface DeleteCotizacionProps {
  id: string;
}

export default function DeleteCotizacion({ id }: DeleteCotizacionProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleDelete = () => {
    startTransition(async () => {
      const result = await deleteCotizacion(id);

      if (result.success) {
        toast.success("Cotización eliminada exitosamente");
        router.push("/dashboard/cotizaciones?refresh=true"); 
      } else {
        toast.error(result.error);
      }
    });
  };
  return (
    <AlertDialog>
      <AlertDialogTrigger asChild>
        <button className="cursor-pointer">
          <Trash width={20} />
        </button>
      </AlertDialogTrigger>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>¿Estás seguro?</AlertDialogTitle>
          <AlertDialogDescription>
            Esta acción no se puede deshacer. Se eliminará permanentemente la cotización.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="cursor-pointer">Cancelar</AlertDialogCancel>
          <AlertDialogAction disabled={isPending} onClick={handleDelete} className="bg-destructive hover:bg-destructive/90 cursor-pointer">
            Eliminar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

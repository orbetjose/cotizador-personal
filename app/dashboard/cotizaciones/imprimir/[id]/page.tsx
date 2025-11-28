"use client";

import CotizacionPDF from "@/components/pdf/CotizacionPDF";
import { useParams } from "next/navigation";

export default function imprimirPage() {
  const params = useParams<{ id: string }>();
  return (
    <div>
      <CotizacionPDF id={params.id} />
    </div>
  );
}

"use client";

import { Page, Text, View, Document, StyleSheet, Image, Link, PDFDownloadLink } from "@react-pdf/renderer";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/client";
import { CotizacionPDFProps } from "@/app/types";
import dynamic from "next/dynamic";
import { Button } from "@/components/ui/button";

const PDFViewer = dynamic(() => import("@react-pdf/renderer").then((mod) => mod.PDFViewer), { ssr: false });

// Create styles
export const styles = StyleSheet.create({
  page: {
    backgroundColor: "#fff",
    color: "#262626",
    fontFamily: "Helvetica",
    fontSize: "12px",
    padding: "30px 50px",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
    fontWeight: "bold",
    fontSize: 12,
  },
  section: {
    margin: 10,
    padding: 10,
    flexGrow: 1,
  },
  info_cliente: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 6,
  },
  image: {
    width: 60,
    height: 40,
    objectFit: "contain",
  },
  separador: {
    borderBottom: "1px solid #000",
    marginTop: 4,
    marginBottom: 12,
  },
  separadorfinal: {
    borderBottom: "1px solid #000",
    marginTop: 100,
    marginBottom: 8,
  },
  descripcion_servicio: {
    marginTop: 30,
    height: "auto",
    fontWeight: "bold",
    border: "1px solid #000",
    padding: 12,
  },
  detalles_servicio: {
    marginTop: 20,
    fontWeight: "bold",
    height: "auto",
    border: "1px solid #000",
    padding: 12,
  },
  totales: {
    textAlign: "right",
    fontWeight: "bold",
  },
  footer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 80,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
});

const DocumentPDF = ({ data }: { data: CotizacionPDFProps }) => (
  <Document>
    <Page
      size="A4"
      style={styles.page}>
      <Text
        style={{ textAlign: "center", marginBottom: 16, textTransform: "uppercase", fontWeight: "bold", fontSize: 16 }}>
        Cotización
      </Text>
      <View style={styles.header}>
        <Image
          style={styles.image}
          src="/images/logo.png"
        />
        <View style={{ flexDirection: "column", alignItems: "flex-end" }}>
          <Text style={{ marginBottom: 6 }}>
            Fecha: {data?.created_at ? new Date(data?.created_at).toLocaleDateString() : ""}
          </Text>
          <Text>NRO. {data?.numero_cotizacion}</Text>
        </View>
      </View>

      <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
        <View>
          <Text style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>Razón social:</Text> {data?.razon_social}
          </Text>
          <Text style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>Documento fiscal:</Text> {data?.tipo_documento}{" "}
            {data?.documento_fiscal}
          </Text>
        </View>
        <View>
          <Text style={{ marginBottom: 4 }}>
            <Text style={{ fontWeight: "bold" }}>Cliente:</Text> {data?.cliente}
          </Text>
          {data?.correo && (
            <Text style={{ marginBottom: 4 }}>
              <Text style={{ fontWeight: "bold" }}>Correo:</Text> {data?.correo}
            </Text>
          )}
          {data?.telefono && (
            <Text style={{ marginBottom: 4 }}>
              <Text style={{ fontWeight: "bold" }}>Teléfono:</Text> {data?.telefono}
            </Text>
          )}
        </View>
      </View>
      <View style={styles.descripcion_servicio}>
        <Text>Descripción del servicio</Text>
        <View style={styles.separador} />
        <Text style={{ fontWeight: "normal", lineHeight: 0.9 }}>{data?.descripcion_servicio}</Text>
      </View>
      <View style={styles.detalles_servicio}>
        <Text>Detalles del servicio</Text>
        <View style={styles.separador} />
        <Text style={{ fontWeight: "bold", marginLeft: 4, marginBottom: 6 }}>Propuesta de servicio:</Text>
        {data?.tareas_servicio.length > 0 &&
          data.tareas_servicio.map((tarea: string, index: number) => (
            <Text
              key={index}
              style={{ fontWeight: "normal", marginLeft: 10, marginBottom: 4 }}>
              {tarea}
            </Text>
          ))}
        <Text style={{ fontWeight: "bold", marginLeft: 4, marginBottom: 6, marginTop: 14 }}>Tecnologías:</Text>
        {data?.tecnologias_servicio.length > 0 &&
          data.tecnologias_servicio.map((tecnologia: string, index: number) => (
            <Text
              key={index}
              style={{ fontWeight: "normal", marginLeft: 10, marginBottom: 4 }}>
              {tecnologia}
            </Text>
          ))}
      </View>
      <View
        style={{
          alignItems: "center",
          flexDirection: "row",
          justifyContent: "space-between",
          border: "1px solid #000",
          padding: 8,
          marginTop: 20,
        }}>
        <Text style={styles.totales}>Costo total</Text>
        <Text style={styles.totales}>S/ {data?.total}</Text>
      </View>
      <View style={styles.footer}>
        <View>
          <Text style={{ marginBottom: 4 }}>Orbet Lozada</Text>
          <Link
            src="https://orbet-lozada.netlify.app/"
            style={{ textDecoration: "underline", color: "#000" }}>
            Portafolio
          </Link>
        </View>
        <View>
          <Text style={{ marginBottom: 4 }}>RUC: 15607362073</Text>
          <Text>(+57) 3147907482</Text>
        </View>
      </View>
    </Page>
  </Document>
);

export default function CotizacionPDF({ id }: { id: string }) {
  const [cotizacionData, setCotizacionData] = useState<CotizacionPDFProps | null>(null);
  const getCotizacionData = async (id: string) => {
    try {
      const supabase = createClient();

      const { data, error } = await supabase.from("cotizaciones").select().eq("id", id).single();

      if (error) {
        throw new Error(`Error al obtener la cotización: ${error.message}`);
      }

      setCotizacionData(data);
    } catch (error) {
      console.error("Error fetching cotización data:", error);
    }
  };

  useEffect(() => {
    getCotizacionData(id);
  }, [id]);

  if (!cotizacionData) return <p>Cargando PDF...</p>;

  return (
    <div className="relative ">
      <div className="flex justify-center mb-4">
        <Button>
          <PDFDownloadLink
            document={<DocumentPDF data={cotizacionData} />}
            fileName={`cotizacion_${cotizacionData.numero_cotizacion}.pdf`}>
            {({ loading }) => (loading ? "Loading document..." : "Descargar PDF")}
          </PDFDownloadLink>
        </Button>
      </div>
      <PDFViewer
        showToolbar={false}
        style={{ width: "100%", height: "90vh" }}>
        <DocumentPDF data={cotizacionData} />
      </PDFViewer>
    </div>
  );
}

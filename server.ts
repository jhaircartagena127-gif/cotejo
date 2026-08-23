import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type, Schema } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

let aiClient: GoogleGenAI | null = null;

function getAIClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }
    aiClient = new GoogleGenAI({ apiKey });
  }
  return aiClient;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Increase payload limit for scanned invoices and photo uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API: Health check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", service: "Cotejo Auditor API", timestamp: new Date().toISOString() });
  });

  // API: Audit document with Gemini Multimodal extraction + Uncertainty scoring
  app.post("/api/extract", async (req, res) => {
    try {
      const { imageBase64, mimeType = "image/jpeg", fileName = "documento" } = req.body;

      if (!imageBase64) {
        return res.status(400).json({ error: "No se proporcionó la imagen del comprobante (imageBase64 requerido)" });
      }

      const cleanBase64 = imageBase64.replace(/^data:image\/[a-z]+;base64,/, "");

      const ai = getAIClient();

      const prompt = `Eres el motor de extracción y auditoría COTEJO (QVAC Track).
Tu principio cardinal es: "UN AGENTE QUE MARCA INCERTIDUMBRE LE GANA A UNO QUE ALUCINA UN NÚMERO CON CONFIANZA".
NO adivines si la imagen está borrosa, manchada, cortada o arrugada.

Analiza el comprobante adjunto y extrae:
1. 'emisor': Razón social o nombre del emisor/comercio.
2. 'cuit_o_id': Identificación fiscal (CUIT, RUT, RFC, NIF) si es visible.
3. 'fecha': Fecha en formato YYYY-MM-DD si es legible, o null si está borrosa.
4. 'numero_comprobante': Número de factura/ticket (ej: 0001-00049281, Factura B 1204, etc).
5. 'tipo_comprobante': FACTURA_A, FACTURA_B, FACTURA_C, TICKET, RECIBO, o NOTA_MANUSCRITA.
6. 'subtotal': Monto numérico neto o subtotal sin impuestos. Si no está discriminado o no es legible, null.
7. 'impuestos': Monto total de impuestos (IVA, percepciones). Si no aplica o no se lee, 0 o null.
8. 'total': Monto total final pagado o a pagar.
9. 'items': Lista de líneas detalladas { descripcion, cantidad, precio_unitario, total_linea, confianza }.
10. 'calidad_imagen': 'optima' | 'torcida' | 'arrugada' | 'termico_desvanecido' | 'manchada' | 'baja_iluminacion'.
11. 'confianza_campos': Para cada campo ('emisor', 'fecha', 'numero_comprobante', 'subtotal', 'impuestos', 'total'), asigna un número de 0 a 100 indicando certeza de lectura. SI EL TEXTO ESTÁ BORROSO O DUDOSO, ASIGNA < 80.
12. 'coordenadas_bbox': Bounding boxes aproximados en porcentajes de imagen (top, left, width, height en 0-100) para ubicar el recorte de: emisor, fecha, numero_comprobante, total.
13. 'observaciones_auditoria': Explicación breve de cualquier zona ilegible, corte o duda en el comprobante.

Responde estrictamente en formato JSON.`;

      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: [
          {
            role: "user",
            parts: [
              { text: prompt },
              {
                inlineData: {
                  mimeType: mimeType,
                  data: cleanBase64,
                },
              },
            ],
          },
        ],
        config: {
          responseMimeType: "application/json",
          temperature: 0.1, // High determinism, low hallucination
        },
      });

      const responseText = response.text || "{}";
      let extractedData;
      try {
        extractedData = JSON.parse(responseText);
      } catch (parseErr) {
        return res.status(500).json({
          error: "Error parseando respuesta estructurada del modelo",
          raw: responseText,
        });
      }

      res.json({
        success: true,
        fileName,
        extracted: extractedData,
      });
    } catch (err: any) {
      console.error("Error en extracción:", err);
      res.status(500).json({
        error: err.message || "Error al procesar el documento con el modelo multimodal",
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Cotejo Audit Server running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Failed to start server:", err);
  process.exit(1);
});

import { NextRequest, NextResponse } from "next/server";
// @ts-ignore
import PDFParser from "pdf2json";

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File | null;
    
    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    if (file.name.toLowerCase().endsWith(".pdf")) {
      return new Promise((resolve) => {
        const pdfParser = new PDFParser(null, 1);
        
        pdfParser.on("pdfParser_dataError", (errData: any) => {
          resolve(NextResponse.json({ error: errData.parserError }, { status: 500 }));
        });
        
        pdfParser.on("pdfParser_dataReady", () => {
          const rawText = pdfParser.getRawTextContent();
          // Clean up the text: remove \r, collapse multiple newlines and spaces
          const cleanText = rawText
             .replace(/\r\n/g, "\n")
             .replace(/\r/g, "\n")
             .replace(/--- Page \d+ ---/g, "")
             .trim();
          resolve(NextResponse.json({ text: cleanText }));
        });
        
        pdfParser.parseBuffer(buffer);
      });
    }

    // If it's a text file
    const text = buffer.toString("utf-8");
    return NextResponse.json({ text });

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

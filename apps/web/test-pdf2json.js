const PDFParser = require("pdf2json");

function parsePdfProperly(buffer) {
  return new Promise((resolve, reject) => {
    const pdfParser = new PDFParser(null, 1);
    
    pdfParser.on("pdfParser_dataError", errData => reject(errData.parserError));
    pdfParser.on("pdfParser_dataReady", pdfData => {
      let fullText = "";
      
      if (!pdfData || !pdfData.formImage || !pdfData.formImage.Pages) {
          resolve("");
          return;
      }
      
      pdfData.formImage.Pages.forEach(page => {
        // Group texts by roughly the same Y coordinate (line)
        const lines = {};
        
        page.Texts.forEach(textObj => {
            const y = Math.round(textObj.y * 10) / 10; // group by 0.1 increments
            if (!lines[y]) lines[y] = [];
            lines[y].push(textObj);
        });
        
        // Sort Y coordinates
        const sortedY = Object.keys(lines).map(Number).sort((a, b) => a - b);
        
        sortedY.forEach(y => {
            // Sort by X coordinate for each line
            lines[y].sort((a, b) => a.x - b.x);
            
            const lineText = lines[y].map(t => decodeURIComponent(t.R[0].T)).join(" ");
            fullText += lineText + "\n";
        });
        
        fullText += "\n";
      });
      
      resolve(fullText);
    });
    
    pdfParser.parseBuffer(buffer);
  });
}

const fs = require('fs');
parsePdfProperly(fs.readFileSync('test2.pdf')).then(console.log).catch(console.error);

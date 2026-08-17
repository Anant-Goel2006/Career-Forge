const fs = require('fs');
const PDFParser = require('pdf2json');

const pdfParser = new PDFParser(null, 1);

pdfParser.on("pdfParser_dataError", errData => console.error(errData.parserError));
pdfParser.on("pdfParser_dataReady", pdfData => {
    let fullText = "";
    if (!pdfData || !pdfData.formImage || !pdfData.formImage.Pages) {
        console.log("NO PAGES");
        return;
    }
    
    pdfData.formImage.Pages.forEach((page) => {
        const lines = {};
        page.Texts.forEach((textObj) => {
            const y = Math.round(textObj.y * 5) / 5;
            if (!lines[y]) lines[y] = [];
            lines[y].push(textObj);
        });
        
        const sortedY = Object.keys(lines).map(Number).sort((a, b) => a - b);
        
        sortedY.forEach(y => {
            lines[y].sort((a, b) => a.x - b.x);
            const lineText = lines[y].map(t => decodeURIComponent(t.R[0].T)).join(" ");
            fullText += lineText + "\n";
        });
        
        const trimmedText = fullText.trim();
        const upperText = trimmedText.substring(0, 400).toLowerCase();
        const lowerText = trimmedText.substring(trimmedText.length - 400).toLowerCase();
        
        const hasBottomContact = lowerText.includes("summary") || lowerText.includes("education") || lowerText.includes("@gmail.com") || lowerText.includes("linkedin.com") || lowerText.includes("@");
        const hasTopContact = upperText.includes("summary") || upperText.includes("education") || upperText.includes("@gmail.com") || upperText.includes("linkedin.com") || upperText.includes("@");
        
        if (hasBottomContact && !hasTopContact) {
            fullText = fullText.split('\n').reverse().join('\n');
        }
        
        fullText += "\n";
    });
    
    console.log("====== EXTRACTED TEXT ======");
    console.log(fullText);
});

pdfParser.loadPDF("./test_resume.pdf");

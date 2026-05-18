import * as pdfjsLib from 'pdfjs-dist';

pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
  'pdfjs-dist/build/pdf.worker.min.mjs',
  import.meta.url
).toString();

pdfjsLib.GlobalWorkerOptions.verbosity = 0; // hide warnings

// Extracts text from the first 2 pages of a PDF ArrayBuffer
async function extractText(arrayBuffer) {
  const pdfjsVersion = pdfjsLib.version;
  const pdf = await pdfjsLib.getDocument({ 
    data: arrayBuffer,
    standardFontDataUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/standard_fonts/`,
    cMapUrl: `https://unpkg.com/pdfjs-dist@${pdfjsVersion}/cmaps/`,
    cMapPacked: true,
    verbosity: 0,
    disableFontFace: true,
  }).promise;
  const maxPages = Math.min(pdf.numPages, 2);
  let text = '';
  for (let i = 1; i <= maxPages; i++) {
    const page = await pdf.getPage(i);
    const content = await page.getTextContent();
    text += content.items.map(item => item.str).join(' ') + ' ';
  }
  return text;
}

// Returns the text between "To" and "Dear Sir/Madam" or "Sir/Madam"
export async function extractToSection(arrayBuffer) {
  const text = await extractText(arrayBuffer);
  const match = text.match(/\bTo\b([\s\S]+?)(?:Dear\s+Sir|Sir\s*[/\\]\s*Madam|\bMadam\b)/i);
  return match ? match[1].trim() : null;
}

// Returns true if the "To" section mentions Alternative Investment Funds
export function hasAIFMention(toSection) {
  if (!toSection) return false;
  return /Alternative\s+Investment\s+Fund/i.test(toSection);
}

import html2canvas from 'html2canvas-pro';
import { jsPDF } from 'jspdf';
import type { Profile } from '../types';

// We use html2canvas-pro (a maintained fork of html2canvas) because the
// upstream html2canvas bundled in html2pdf.js cannot parse modern CSS color
// functions (oklch, oklab, color(), lab(), lch()), and Tailwind v4 uses oklch
// throughout its theme. html2canvas-pro understands these natively.

const PAGE_FORMAT = 'a4' as const;
const ORIENTATION = 'portrait' as const;
const MARGIN_MM = 10;

export async function exportToPDF(elementId: string, filename = 'CV.pdf') {
  const element = document.getElementById(elementId);
  if (!element) return;

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    backgroundColor: '#ffffff',
    logging: false,
  });

  const pdf = new jsPDF({
    orientation: ORIENTATION,
    unit: 'mm',
    format: PAGE_FORMAT,
  });

  const pageWidth = pdf.internal.pageSize.getWidth();
  const pageHeight = pdf.internal.pageSize.getHeight();
  const usableWidth = pageWidth - MARGIN_MM * 2;
  const usableHeight = pageHeight - MARGIN_MM * 2;

  const imgWidth = usableWidth;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;
  const imgData = canvas.toDataURL('image/png');

  if (imgHeight <= usableHeight) {
    pdf.addImage(imgData, 'PNG', MARGIN_MM, MARGIN_MM, imgWidth, imgHeight);
  } else {
    let remaining = imgHeight;
    let offset = 0;
    while (remaining > 0) {
      pdf.addImage(imgData, 'PNG', MARGIN_MM, MARGIN_MM - offset, imgWidth, imgHeight);
      remaining -= usableHeight;
      offset += usableHeight;
      if (remaining > 0) pdf.addPage();
    }
  }

  pdf.save(filename);
}

export function exportToJSON(profile: Profile, filename = 'perfil-cv.json') {
  const blob = new Blob([JSON.stringify(profile, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

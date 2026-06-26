import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const LOGO_PATH = `${process.env.PUBLIC_URL || ''}/ryde-icon.png`;

let logoDataUrlPromise = null;

function loadLogoDataUrl() {
    if (!logoDataUrlPromise) {
        logoDataUrlPromise = fetch(LOGO_PATH)
            .then((res) => {
                if (!res.ok) throw new Error('Logo not found');
                return res.blob();
            })
            .then(
                (blob) =>
                    new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = () => resolve(reader.result);
                        reader.onerror = reject;
                        reader.readAsDataURL(blob);
                    })
            )
            .catch(() => null);
    }
    return logoDataUrlPromise;
}

function cellValue(value) {
    if (value == null || value === '') return '—';
    return String(value);
}

/**
 * @param {{
 *   title: string,
 *   subtitle?: string,
 *   columns?: string[],
 *   rows?: (string|number)[][],
 *   summary?: { label: string, value: string }[],
 *   sections?: { title: string, columns: string[], rows: (string|number)[][] }[]
 * }} config
 */
export async function generateReportPdf({ title, subtitle, columns, rows, summary = [], sections = [] }) {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const logo = await loadLogoDataUrl();
    const generatedAt = new Date().toLocaleString();

    if (logo) {
        doc.addImage(logo, 'PNG', 14, 12, 14, 14);
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(16);
    doc.setTextColor(17, 24, 39);
    doc.text('RYDE', logo ? 32 : 14, 18);

    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(107, 114, 128);
    doc.text('Transport System', logo ? 32 : 14, 23);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(17, 24, 39);
    doc.text(title, 14, 36);

    let startY = 42;
    if (subtitle) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(10);
        doc.setTextColor(75, 85, 99);
        doc.text(subtitle, 14, startY);
        startY += 6;
    }

    doc.setFontSize(9);
    doc.setTextColor(156, 163, 175);
    doc.text(`Generated: ${generatedAt}`, 14, startY);
    startY += 8;

    if (summary.length > 0) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(10);
        doc.setTextColor(17, 24, 39);
        doc.text('Summary', 14, startY);
        startY += 5;

        const summaryBody = summary.map((item) => [item.label, cellValue(item.value)]);
        autoTable(doc, {
            startY,
            head: [['Metric', 'Value']],
            body: summaryBody,
            theme: 'plain',
            styles: { fontSize: 9, cellPadding: 2 },
            headStyles: { fillColor: [17, 24, 39], textColor: 255 },
            margin: { left: 14, right: 14 },
        });
        startY = doc.lastAutoTable.finalY + 8;
    }

    const renderTable = (tableColumns, tableRows, y) => {
        const tableBody = (tableRows || []).map((row) => row.map(cellValue));
        autoTable(doc, {
            startY: y,
            head: [tableColumns],
            body: tableBody.length > 0 ? tableBody : [['No records']],
            theme: 'striped',
            styles: { fontSize: 8, cellPadding: 2.5, overflow: 'linebreak' },
            headStyles: { fillColor: [17, 24, 39], textColor: 255, fontStyle: 'bold' },
            alternateRowStyles: { fillColor: [249, 250, 251] },
            margin: { left: 14, right: 14 },
        });
        return doc.lastAutoTable.finalY + 8;
    };

    const reportSections = sections.length > 0
        ? sections
        : columns
            ? [{ title: null, columns, rows: rows || [] }]
            : [];

    reportSections.forEach((section) => {
        if (startY > doc.internal.pageSize.getHeight() - 40) {
            doc.addPage();
            startY = 20;
        }

        if (section.title) {
            doc.setFont('helvetica', 'bold');
            doc.setFontSize(11);
            doc.setTextColor(17, 24, 39);
            doc.text(section.title, 14, startY);
            startY += 6;
        }

        startY = renderTable(section.columns, section.rows, startY);
    });

    if (reportSections.length === 0) {
        renderTable(['Info'], [['No data to export']], startY);
    }

    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i += 1) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.setTextColor(156, 163, 175);
        doc.text(`Page ${i} of ${pageCount}`, doc.internal.pageSize.getWidth() - 14, doc.internal.pageSize.getHeight() - 8, {
            align: 'right',
        });
    }

    return doc;
}

export function downloadReportPdf(doc, filename) {
    const safeName = (filename || 'ryde-export').replace(/[^\w.-]+/g, '-');
    doc.save(`${safeName}.pdf`);
}

export function pdfToBase64(doc) {
    return doc.output('datauristring').split(',')[1];
}

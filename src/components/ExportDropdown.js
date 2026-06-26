import React, { useEffect, useRef, useState } from 'react';
import { ChevronDown, Download, Loader, Mail } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { downloadReportPdf, generateReportPdf, pdfToBase64 } from '../utils/exportPdf';

const ExportDropdown = ({ exportConfig, disabled = false, className = '' }) => {
    const { user } = useAuth();
    const [open, setOpen] = useState(false);
    const [busy, setBusy] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (containerRef.current && !containerRef.current.contains(e.target)) {
                setOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const runExport = async (mode) => {
        if (!exportConfig || busy || disabled) return;
        setBusy(true);
        setOpen(false);
        try {
            const doc = await generateReportPdf(exportConfig);
            const filename = exportConfig.filename || 'ryde-export';

            if (mode === 'download') {
                downloadReportPdf(doc, filename);
                return;
            }

            const recipient = exportConfig.email || user?.email;
            if (!recipient) {
                alert('No email address found. Please update your profile or download the PDF instead.');
                return;
            }

            await api.sendExportEmail({
                email: recipient,
                filename,
                reportTitle: exportConfig.title,
                pdfBase64: pdfToBase64(doc),
            });
            alert(`Report sent to ${recipient}`);
        } catch (err) {
            alert(err.message || 'Export failed. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    if (!exportConfig) return null;

    return (
        <div ref={containerRef} className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled || busy}
                onClick={() => setOpen((v) => !v)}
                className="flex items-center gap-2 px-4 py-2.5 btn-outline-primary rounded-lg text-sm font-medium disabled:opacity-50"
                aria-expanded={open}
                aria-haspopup="menu"
            >
                {busy ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
                Export
                <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
            </button>

            {open && (
                <div
                    role="menu"
                    className="absolute right-0 mt-2 w-52 bg-white border border-gray-200 rounded-lg shadow-lg py-1 z-50"
                >
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => runExport('download')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                        <Download size={16} className="text-gray-500" />
                        Download PDF
                    </button>
                    <button
                        type="button"
                        role="menuitem"
                        onClick={() => runExport('email')}
                        className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                    >
                        <Mail size={16} className="text-gray-500" />
                        Send to email
                    </button>
                </div>
            )}
        </div>
    );
};

export default ExportDropdown;

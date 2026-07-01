import React, { useState } from 'react';
import { Download, Loader } from 'lucide-react';
// import { ChevronDown, Mail, ArrowLeft } from 'lucide-react';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';
import { downloadReportPdf, generateReportPdf } from '../utils/exportPdf';
// import { pdfToBase64 } from '../utils/exportPdf';

// const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim());

const ExportDropdown = ({ exportConfig, disabled = false, className = '' }) => {
    // const { user } = useAuth();
    const [busy, setBusy] = useState(false);
    // const [open, setOpen] = useState(false);
    // const [showEmailForm, setShowEmailForm] = useState(false);
    // const [recipientEmail, setRecipientEmail] = useState('');
    // const containerRef = useRef(null);
    // const emailInputRef = useRef(null);

    // useEffect(() => {
    //     const handleClickOutside = (e) => {
    //         if (containerRef.current && !containerRef.current.contains(e.target)) {
    //             setOpen(false);
    //             setShowEmailForm(false);
    //         }
    //     };
    //     document.addEventListener('mousedown', handleClickOutside);
    //     return () => document.removeEventListener('mousedown', handleClickOutside);
    // }, []);

    // useEffect(() => {
    //     if (showEmailForm && emailInputRef.current) {
    //         emailInputRef.current.focus();
    //     }
    // }, [showEmailForm]);

    // const closeMenu = () => {
    //     setOpen(false);
    //     setShowEmailForm(false);
    // };

    const runDownload = async () => {
        if (!exportConfig || busy || disabled) return;
        setBusy(true);
        try {
            const doc = await generateReportPdf(exportConfig);
            downloadReportPdf(doc, exportConfig.filename || 'ryde-export');
        } catch (err) {
            alert(err.message || 'Export failed. Please try again.');
        } finally {
            setBusy(false);
        }
    };

    // const openEmailForm = () => {
    //     setShowEmailForm(true);
    //     setRecipientEmail(exportConfig?.email || user?.email || '');
    // };

    // const runEmailExport = async (e) => {
    //     e.preventDefault();
    //     if (!exportConfig || busy || disabled) return;
    //
    //     const recipient = recipientEmail.trim();
    //     if (!recipient) {
    //         alert('Please enter an email address.');
    //         return;
    //     }
    //     if (!isValidEmail(recipient)) {
    //         alert('Please enter a valid email address.');
    //         return;
    //     }
    //
    //     setBusy(true);
    //     closeMenu();
    //     try {
    //         const doc = await generateReportPdf(exportConfig);
    //         const filename = exportConfig.filename || 'ryde-export';
    //
    //         await api.sendExportEmail({
    //             email: recipient,
    //             filename,
    //             reportTitle: exportConfig.title,
    //             pdfBase64: pdfToBase64(doc),
    //         });
    //         alert(`Report sent to ${recipient}`);
    //         setRecipientEmail('');
    //     } catch (err) {
    //         alert(err.message || 'Export failed. Please try again.');
    //     } finally {
    //         setBusy(false);
    //     }
    // };

    // const toggleMenu = () => {
    //     if (open) {
    //         closeMenu();
    //     } else {
    //         setOpen(true);
    //         setShowEmailForm(false);
    //     }
    // };

    if (!exportConfig) return null;

    return (
        <div className={`relative ${className}`}>
            <button
                type="button"
                disabled={disabled || busy}
                onClick={runDownload}
                className="flex items-center gap-2 px-4 py-2.5 btn-outline-primary rounded-lg text-sm font-medium disabled:opacity-50"
            >
                {busy ? <Loader size={16} className="animate-spin" /> : <Download size={16} />}
                Download PDF
            </button>

            {/* Email export disabled — PDF download only
            <div ref={containerRef} className={`relative ${className}`}>
                <button
                    type="button"
                    disabled={disabled || busy}
                    onClick={toggleMenu}
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
                        className={`absolute right-0 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg z-50 ${
                            showEmailForm ? 'w-72 p-4' : 'w-52 py-1'
                        }`}
                    >
                        {showEmailForm ? (
                            <form onSubmit={runEmailExport} className="space-y-3">
                                <button
                                    type="button"
                                    onClick={() => setShowEmailForm(false)}
                                    className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-800"
                                >
                                    <ArrowLeft size={14} />
                                    Back
                                </button>
                                <div>
                                    <label htmlFor="export-recipient-email" className="block text-sm font-medium text-gray-700 mb-1">
                                        Send to email
                                    </label>
                                    <input
                                        ref={emailInputRef}
                                        id="export-recipient-email"
                                        type="email"
                                        value={recipientEmail}
                                        onChange={(e) => setRecipientEmail(e.target.value)}
                                        placeholder="name@example.com"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm outline-none focus:ring-2 focus:ring-black/10 focus:border-black"
                                        disabled={busy}
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={busy}
                                    className="w-full flex items-center justify-center gap-2 py-2.5 btn-outline-primary rounded-lg text-sm font-medium disabled:opacity-50"
                                >
                                    {busy ? <Loader size={16} className="animate-spin" /> : <Mail size={16} />}
                                    Send PDF
                                </button>
                            </form>
                        ) : (
                            <>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={runDownload}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                >
                                    <Download size={16} className="text-gray-500" />
                                    Download PDF
                                </button>
                                <button
                                    type="button"
                                    role="menuitem"
                                    onClick={openEmailForm}
                                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 text-left"
                                >
                                    <Mail size={16} className="text-gray-500" />
                                    Send to email
                                </button>
                            </>
                        )}
                    </div>
                )}
            </div>
            */}
        </div>
    );
};

export default ExportDropdown;

import React from 'react';

export const formatRwf = (value) => {
    if (value == null || Number.isNaN(Number(value))) return '—';
    return `RWF ${Number(value).toLocaleString()}`;
};

export const formatLabel = (value) => {
    if (!value) return '—';
    return String(value)
        .toLowerCase()
        .split('_')
        .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
        .join(' ');
};

const TONE_CLASSES = {
    success: 'bg-green-100 text-green-800',
    warning: 'bg-amber-100 text-amber-800',
    danger: 'bg-red-100 text-red-800',
    neutral: 'bg-gray-100 text-gray-700',
    info: 'bg-blue-100 text-blue-800',
    indigo: 'bg-indigo-100 text-indigo-800',
};

export const StatusBadge = ({ label, tone = 'success', className = '' }) => (
    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold ${TONE_CLASSES[tone] || TONE_CLASSES.neutral} ${className}`}>
        {label}
    </span>
);

export const DetailRow = ({ label, value, icon: Icon }) => (
    <div className="flex items-start justify-between gap-4 py-3 border-b border-gray-100 last:border-0">
        <div className="flex items-center gap-2 text-sm text-gray-500 shrink-0">
            {Icon && <Icon size={16} className="text-gray-400" />}
            <span>{label}</span>
        </div>
        <span className="text-sm font-medium text-gray-900 text-right">{value}</span>
    </div>
);

export const auctionStatusMeta = (status) => {
    switch (status) {
        case 'SOLD':
            return { label: 'Sold', tone: 'warning' };
        case 'CANCELLED':
            return { label: 'Cancelled', tone: 'danger' };
        default:
            return { label: 'Available', tone: 'success' };
    }
};

export const rideStatusMeta = (ride) => {
    const status = ride.status || (ride.pending ? 'REQUESTED' : ride.isRideStarted ? 'IN_PROGRESS' : 'REQUESTED');
    const tones = {
        REQUESTED: 'warning',
        ACCEPTED: 'info',
        IN_PROGRESS: 'indigo',
        COMPLETED: 'success',
        CANCELLED: 'danger',
        PENDING: 'warning',
        STARTED: 'indigo',
    };
    return { label: formatLabel(status), tone: tones[status] || 'neutral' };
};

export const driverVerificationMeta = (status) => {
    switch (status) {
        case 'APPROVED':
            return { label: 'Approved', tone: 'success' };
        case 'REJECTED':
            return { label: 'Rejected', tone: 'danger' };
        default:
            return { label: 'Pending', tone: 'warning' };
    }
};

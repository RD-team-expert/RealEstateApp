// utils/paymentUtils.ts
import { format } from 'date-fns';
import { Payment } from '@/types/payments';

/**
 * Always treat the value as a date-only (no time, no TZ).
 * Works for "YYYY-MM-DD" and for ISO strings by grabbing the first 10 chars.
 */
export const formatDateOnly = (value?: string | null, fallback = '-'): string => {
    if (!value) return fallback;

    const m = /^(\d{4})-(\d{2})-(\d{2})/.exec(value);
    if (!m) return fallback;

    const [, y, mo, d] = m;
    const date = new Date(Number(y), Number(mo) - 1, Number(d));
    return format(date, 'P');
};

export const exportToCSV = (data: Payment[], filename: string = 'payments.csv') => {
    try {
        const formatCurrency = (amount: number | null | undefined) => {
            if (amount === null || amount === undefined || isNaN(amount)) return '0.00';
            return Number(amount).toFixed(2);
        };

        const formatString = (value: string | null | undefined) => {
            if (value === null || value === undefined) return '';
            return String(value).replace(/"/g, '""');
        };

        const formatDate = (dateStr: string | null | undefined) => {
            if (!dateStr) return '';
            try {
                return formatDateOnly(dateStr, '');
            } catch (error) {
                return dateStr || '';
            }
        };

        const headers = [
            'ID',
            'Date',
            'City',
            'Property Name',
            'Unit Name',
            'Owes',
            'Paid',
            'Left to Pay',
            'Status',
            'Notes',
            'Reversed Payments',
            'Permanent',
        ];

        const csvData = [
            headers.join(','),
            ...data
                .map((payment) => {
                    try {
                        return [
                            payment.id || '',
                            `"${formatDate(payment.date)}"`,
                            `"${formatString(payment.city)}"`,
                            `"${formatString(payment.property_name)}"`,
                            `"${formatString(payment.unit_name)}"`,
                            formatCurrency(payment.owes),
                            formatCurrency(payment.paid),
                            formatCurrency(payment.left_to_pay),
                            `"${formatString(payment.status)}"`,
                            `"${formatString(payment.notes)}"`,
                            `"${formatString(payment.reversed_payments)}"`,
                            `"${formatString(payment.permanent)}"`,
                        ].join(',');
                    } catch (rowError) {
                        console.error('Error processing payment row:', payment, rowError);
                        return '';
                    }
                })
                .filter((row) => row !== ''),
        ].join('\n');

        const blob = new Blob([csvData], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);

        link.setAttribute('href', url);
        link.setAttribute('download', filename);
        link.style.visibility = 'hidden';

        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);

        return true;
    } catch (error) {
        console.error('CSV Export Error:', error);
        throw error;
    }
};

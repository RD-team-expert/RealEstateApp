import React from 'react';
import { DateField } from './DateField';
import { AmountField } from './AmountField';
import { PaidField } from './PaidField';

interface Props {
    dates: string;
    amount: number;
    paid: number;
    originalPaidAmount: number;
    errors: any;
    onDateChange: (date: string) => void;
    onAmountChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onPaidChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export function PaymentDetailsFields({
    dates,
    amount,
    paid,
    originalPaidAmount,
    errors,
    onDateChange,
    onAmountChange,
    onPaidChange
}: Props) {
    return (
        <>
            <DateField
                dates={dates}
                error={errors.dates}
                onChange={onDateChange}
            />

            <AmountField
                amount={amount}
                originalPaidAmount={originalPaidAmount}
                error={errors.amount}
                onChange={onAmountChange}
            />

            <PaidField
                paid={paid}
                amount={amount}
                error={errors.paid}
                onChange={onPaidChange}
            />
        </>
    );
}

// components/PageHeader.tsx
import { Button } from '@/components/ui/button';
import { Download, Plus } from 'lucide-react';

interface PageHeaderProps {
    onExport: () => void;
    onAddPayment: () => void;
    isExporting: boolean;
    hasData: boolean;
    canCreate: boolean;
}

export default function PageHeader({ 
    onExport, 
    onAddPayment, 
    isExporting, 
    hasData, 
    canCreate 
}: PageHeaderProps) {
    return (
        <div className="mb-6 flex items-center justify-between">
            <h1 className="text-2xl font-bold text-foreground">Payments Management</h1>
            <div className="flex items-center gap-2">
                <Button
                    variant="outline"
                    size="sm"
                    onClick={onExport}
                    disabled={isExporting || !hasData}
                    className="flex items-center"
                >
                    <Download className="mr-2 h-4 w-4" />
                    {isExporting ? 'Exporting...' : 'Export CSV'}
                </Button>

                {canCreate && (
                    <Button onClick={onAddPayment} className="bg-primary text-background">
                        <Plus className="mr-2 h-4 w-4" />
                        Add Payment
                    </Button>
                )}
            </div>
        </div>
    );
}

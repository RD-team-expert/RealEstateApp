// components/StatusBadge.tsx
import { Badge } from '@/components/ui/badge';

interface StatusBadgeProps {
    status: string | null;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
    if (!status) return <Badge variant="outline">N/A</Badge>;

    if (status.toLowerCase().includes('paid')) {
        return (
            <Badge variant="default" className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                {status}
            </Badge>
        );
    } else if (status.toLowerCase().includes('pending')) {
        return (
            <Badge variant="secondary" className="bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300">
                {status}
            </Badge>
        );
    } else {
        return <Badge variant="outline">{status}</Badge>;
    }
}

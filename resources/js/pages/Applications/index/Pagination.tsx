// resources/js/Pages/Applications/components/Pagination.tsx
import { router } from '@inertiajs/react';

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface PaginationProps {
    links: PaginationLink[];
    lastPage: number;
}

export default function Pagination({ links, lastPage }: PaginationProps) {
    if (lastPage <= 1) return null;

    return (
        <div className="mt-6 flex justify-center">
            <nav className="flex space-x-2">
                {links.map((link, index) => (
                    <button
                        key={index}
                        onClick={() => link.url && router.get(link.url)}
                        disabled={!link.url}
                        className={`rounded px-3 py-2 text-sm ${
                            link.active
                                ? 'bg-primary text-primary-foreground'
                                : link.url
                                  ? 'bg-muted text-foreground hover:bg-accent'
                                  : 'cursor-not-allowed bg-muted text-muted-foreground'
                        }`}
                        dangerouslySetInnerHTML={{ __html: link.label }}
                    />
                ))}
            </nav>
        </div>
    );
}

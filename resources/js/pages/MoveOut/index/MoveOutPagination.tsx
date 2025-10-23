interface MoveOutPaginationProps {
    meta: {
        from?: number;
        to?: number;
        total?: number;
    };
}

export default function MoveOutPagination({ meta }: MoveOutPaginationProps) {
    return (
        <div className="mt-6 flex items-center justify-between border-t border-border pt-4">
            <div className="text-sm text-muted-foreground">
                Showing {meta.from || 0} to {meta.to || 0} of {meta.total || 0} results
            </div>
        </div>
    );
}

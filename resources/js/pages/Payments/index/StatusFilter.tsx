import { useState, useRef, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import { Button } from '@/components/ui/button';


interface StatusFilterProps {
    value: string[];
    onChange: (value: string[]) => void;
}


const STATUS_OPTIONS = ['Paid', "Didn't Pay", 'Paid Partly', 'Overpaid'];


export default function StatusFilter({ value, onChange }: StatusFilterProps) {
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleStatus = (status: string) => {
        if (value.includes(status)) {
            onChange(value.filter(s => s !== status));
        } else {
            onChange([...value, status]);
        }
    };

    const selectedCount = value.length;
    const displayText = selectedCount === 0 ? 'Status' : `Status (${selectedCount})`;

    return (
        <div className="relative" ref={dropdownRef}>
            <Button
                variant="outline"
                onClick={() => setShowDropdown(!showDropdown)}
                className="w-full justify-between"
            >
                <span>{displayText}</span>
                <ChevronDown className="h-4 w-4" />
            </Button>

            {showDropdown && (
                <div className="absolute top-full left-0 right-0 z-50 mt-1 rounded-md border border-input bg-popover shadow-lg">
                    {STATUS_OPTIONS.map((status) => (
                        <label key={status} className="flex items-center px-3 py-2 hover:bg-accent cursor-pointer">
                            <input
                                type="checkbox"
                                checked={value.includes(status)}
                                onChange={() => toggleStatus(status)}
                                className="mr-2 h-4 w-4 rounded border border-input"
                            />
                            <span className="text-sm">{status}</span>
                        </label>
                    ))}
                </div>
            )}
        </div>
    );
}

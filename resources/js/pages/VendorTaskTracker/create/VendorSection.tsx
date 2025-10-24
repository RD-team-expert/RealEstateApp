import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

interface VendorOption {
    id: number;
    vendor_name: string;
    city?: string;
}

interface VendorSectionProps {
    availableVendors: VendorOption[];
    selectedCity: string;
    vendorId: string;
    onVendorChange: (vendorId: string) => void;
    vendorRef: React.RefObject<HTMLButtonElement>;
    errors: Partial<Record<string, string>>; // Changed from Record<string, string>
    validationError: string;
}

export default function VendorSection({
    availableVendors,
    selectedCity,
    vendorId,
    onVendorChange,
    vendorRef,
    errors,
    validationError
}: VendorSectionProps) {
    const [vendorInput, setVendorInput] = useState('');
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const [filteredVendors, setFilteredVendors] = useState<VendorOption[]>([]);
    const vendorInputRef = useRef<HTMLInputElement>(null);
    const vendorDropdownRef = useRef<HTMLDivElement>(null);

    // Update input when vendorId changes (for form reset)
    useEffect(() => {
        if (vendorId) {
            const selectedVendor = availableVendors.find(vendor => vendor.id.toString() === vendorId);
            if (selectedVendor) {
                setVendorInput(selectedVendor.vendor_name);
            }
        } else {
            setVendorInput('');
        }
    }, [vendorId, availableVendors]);

    // Filter vendors based on input
    useEffect(() => {
        if (!availableVendors) {
            setFilteredVendors([]);
            return;
        }

        if (vendorInput.trim() === '') {
            setFilteredVendors(availableVendors);
        } else {
            const filtered = availableVendors.filter((vendor) =>
                vendor.vendor_name.toLowerCase().includes(vendorInput.toLowerCase())
            );
            setFilteredVendors(filtered);
        }
    }, [vendorInput, availableVendors]);

    // Handle clicks outside dropdown
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                vendorDropdownRef.current &&
                !vendorDropdownRef.current.contains(event.target as Node) &&
                vendorInputRef.current &&
                !vendorInputRef.current.contains(event.target as Node)
            ) {
                setShowVendorDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleVendorSelect = (vendor: VendorOption) => {
        setVendorInput(vendor.vendor_name);
        onVendorChange(vendor.id.toString());
        setShowVendorDropdown(false);
    };

    const handleVendorInputChange = (value: string) => {
        setVendorInput(value);
        setShowVendorDropdown(true);
        
        // If input doesn't match any vendor exactly, clear the selection
        const exactMatch = availableVendors.find(vendor => 
            vendor.vendor_name.toLowerCase() === value.toLowerCase()
        );
        if (!exactMatch && vendorId) {
            onVendorChange('');
        }
    };

    return (
        <div className="rounded-lg border-l-4 border-l-purple-500 p-4">
            <div className="mb-2">
                <Label htmlFor="vendor_name" className="text-base font-semibold">
                    Vendor Name *
                </Label>
            </div>
            <div className="relative">
                <Input
                    ref={vendorInputRef}
                    type="text"
                    placeholder={selectedCity ? "Type to search vendors..." : "Select a city first"}
                    value={vendorInput}
                    onChange={(e) => handleVendorInputChange(e.target.value)}
                    onFocus={() => selectedCity && setShowVendorDropdown(true)}
                    disabled={!selectedCity}
                    className="text-input-foreground bg-input pr-8"
                />
                <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                {showVendorDropdown && filteredVendors.length > 0 && selectedCity && (
                    <div
                        ref={vendorDropdownRef}
                        className="absolute top-full right-0 left-0 z-50 mt-1 max-h-60 overflow-auto rounded-md border border-input bg-popover shadow-lg"
                    >
                        {filteredVendors.map((vendor) => (
                            <div
                                key={vendor.id}
                                className="cursor-pointer px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground"
                                onClick={() => handleVendorSelect(vendor)}
                            >
                                {vendor.vendor_name}
                                {vendor.city && (
                                    <span className="ml-2 text-xs text-muted-foreground">
                                        ({vendor.city})
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {showVendorDropdown && filteredVendors.length === 0 && vendorInput.trim() !== '' && selectedCity && (
                    <div
                        ref={vendorDropdownRef}
                        className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border border-input bg-popover shadow-lg"
                    >
                        <div className="px-3 py-2 text-sm text-muted-foreground">
                            No vendors found matching "{vendorInput}"
                        </div>
                    </div>
                )}
            </div>
            
            {/* Hidden button for ref compatibility */}
            <button ref={vendorRef} type="button" className="hidden" />
            
            {errors.vendor_id && <p className="mt-1 text-sm text-red-600">{errors.vendor_id}</p>}
            {validationError && <p className="mt-1 text-sm text-red-600">{validationError}</p>}
        </div>
    );
}

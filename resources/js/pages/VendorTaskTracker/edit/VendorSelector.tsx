import { Input } from '@/components/ui/input';
import { ChevronDown } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import FormSection from './FormSection';

interface VendorOption {
    id: number;
    vendor_name: string;
    city?: string;
}

interface VendorSelectorProps {
    vendors: VendorOption[];
    selectedVendorId: string;
    onVendorChange: (vendorId: string) => void;
    vendorRef: React.RefObject<HTMLButtonElement>;
    disabled: boolean;
    error?: string;
    validationError?: string;
}

export default function VendorSelector({
    vendors,
    selectedVendorId,
    onVendorChange,
    vendorRef,
    disabled,
    error,
    validationError,
}: VendorSelectorProps) {
    const [vendorInput, setVendorInput] = useState('');
    const [showVendorDropdown, setShowVendorDropdown] = useState(false);
    const [filteredVendors, setFilteredVendors] = useState<VendorOption[]>([]);
    const vendorInputRef = useRef<HTMLInputElement>(null);
    const vendorDropdownRef = useRef<HTMLDivElement>(null);

    // Update input when selectedVendorId changes (for form reset or initial load)
    useEffect(() => {
        if (selectedVendorId) {
            const selectedVendor = vendors.find(vendor => vendor.id.toString() === selectedVendorId);
            if (selectedVendor) {
                setVendorInput(selectedVendor.vendor_name);
            }
        } else {
            setVendorInput('');
        }
    }, [selectedVendorId, vendors]);

    // Filter vendors based on input
    useEffect(() => {
        if (!vendors) {
            setFilteredVendors([]);
            return;
        }

        if (vendorInput.trim() === '') {
            setFilteredVendors(vendors);
        } else {
            const filtered = vendors.filter((vendor) =>
                vendor.vendor_name.toLowerCase().includes(vendorInput.toLowerCase())
            );
            setFilteredVendors(filtered);
        }
    }, [vendorInput, vendors]);

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
        
        // Always clear the selection when user types - they must select from dropdown
        if (selectedVendorId) {
            onVendorChange('');
        }
    };

    const handleVendorInputBlur = () => {
        // On blur, if the input doesn't match exactly, clear it and show validation error
        const exactMatch = vendors.find(vendor => 
            vendor.vendor_name.toLowerCase() === vendorInput.toLowerCase()
        );
        
        if (!exactMatch && vendorInput.trim() !== '') {
            setVendorInput('');
            onVendorChange('');
        }
        
        setShowVendorDropdown(false);
    };

    return (
        <FormSection
            label="Vendor Name"
            required={true}
            borderColor="border-l-purple-500"
            error={error}
            validationError={validationError}
        >
            <div className="relative">
                <Input
                    ref={vendorInputRef}
                    type="text"
                    placeholder={disabled ? "Select a city first" : "Type to search vendors..."}
                    value={vendorInput}
                    onChange={(e) => handleVendorInputChange(e.target.value)}
                    onFocus={() => !disabled && setShowVendorDropdown(true)}
                    onBlur={handleVendorInputBlur}
                    disabled={disabled}
                    className="text-input-foreground bg-input pr-8"
                />
                <ChevronDown className="absolute top-1/2 right-2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />

                {showVendorDropdown && filteredVendors.length > 0 && !disabled && (
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

                {showVendorDropdown && filteredVendors.length === 0 && vendorInput.trim() !== '' && !disabled && (
                    <div
                        ref={vendorDropdownRef}
                        className="absolute top-full right-0 left-0 z-50 mt-1 rounded-md border border-input bg-popover shadow-lg"
                    >
                        <div className="px-3 py-2 text-sm text-red-500">
                            No vendors found matching "{vendorInput}". Please select from the available options.
                        </div>
                    </div>
                )}
            </div>
            
            {/* Hidden button for ref compatibility */}
            <button ref={vendorRef} type="button" className="hidden" />
        </FormSection>
    );
}

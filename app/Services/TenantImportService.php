<?php
// app/Services/TenantImportService.php

namespace App\Services;

use App\Models\Tenant;
use App\Models\PropertyInfoWithoutInsurance;
use App\Models\Unit;
use Illuminate\Http\UploadedFile;
use Illuminate\Support\Collection;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Validator;

class TenantImportService
{
    protected array $errors = [];
    protected array $warnings = [];
    protected int $successCount = 0;
    protected int $errorCount = 0;
    protected int $duplicateCount = 0;

    public function importFromCsv(UploadedFile $file, bool $skipDuplicates = false): array
    {
        $this->resetCounters();

        try {
            $csvData = $this->parseCsvFile($file);
            
            if (empty($csvData)) {
                throw new \Exception('No data found in the CSV file.');
            }

            $this->processImportData($csvData, $skipDuplicates);

            return [
                'success' => true,
                'message' => $this->generateSuccessMessage(),
                'stats' => [
                    'total_processed' => count($csvData),
                    'successful_imports' => $this->successCount,
                    'errors' => $this->errorCount,
                    'duplicates' => $this->duplicateCount,
                ],
                'errors' => $this->errors,
                'warnings' => $this->warnings,
            ];

        } catch (\Exception $e) {
            Log::error('Tenant import failed: ' . $e->getMessage());
            
            return [
                'success' => false,
                'message' => 'Import failed: ' . $e->getMessage(),
                'stats' => [
                    'total_processed' => 0,
                    'successful_imports' => 0,
                    'errors' => 0,
                    'duplicates' => 0,
                ],
                'errors' => [$e->getMessage()],
                'warnings' => [],
            ];
        }
    }

    protected function parseCsvFile(UploadedFile $file): array
    {
        $handle = fopen($file->getPathname(), 'r');
        
        if (!$handle) {
            throw new \Exception('Unable to open the CSV file.');
        }

        $csvData = [];
        $headers = null;
        $rowNumber = 0;

        while (($row = fgetcsv($handle)) !== false) {
            $rowNumber++;
            
            if ($rowNumber === 1) {
                $headers = array_map('trim', $row);
                continue;
            }

            if (empty($headers)) {
                continue;
            }

            // Skip empty rows
            if (empty(array_filter($row))) {
                continue;
            }

            $csvData[] = array_combine($headers, array_pad($row, count($headers), null));
        }

        fclose($handle);

        return $csvData;
    }

    protected function processImportData(array $csvData, bool $skipDuplicates): void
    {
        foreach ($csvData as $index => $row) {
            $rowNumber = $index + 2; // +2 because we start from row 2 (after headers)
            
            try {
                $tenantData = $this->mapCsvRowToTenantData($row, $rowNumber);
                
                if (empty($tenantData)) {
                    continue; // Skip rows with no essential data
                }

                // Check for duplicates
                if ($this->isDuplicate($tenantData)) {
                    if ($skipDuplicates) {
                        $this->duplicateCount++;
                        $this->warnings[] = "Row {$rowNumber}: Duplicate tenant skipped - {$tenantData['first_name']} {$tenantData['last_name']}";
                        continue;
                    } else {
                        $this->errorCount++;
                        $this->errors[] = "Row {$rowNumber}: Duplicate tenant found - {$tenantData['first_name']} {$tenantData['last_name']}";
                        continue;
                    }
                }

                // Validate the tenant data
                $validationResult = $this->validateTenantData($tenantData, $rowNumber);
                
                if (!$validationResult['valid']) {
                    $this->errorCount++;
                    $this->errors = array_merge($this->errors, $validationResult['errors']);
                    continue;
                }

                // Create the tenant
                Tenant::create($tenantData);
                $this->successCount++;

            } catch (\Exception $e) {
                $this->errorCount++;
                $this->errors[] = "Row {$rowNumber}: " . $e->getMessage();
                Log::error("Error importing tenant at row {$rowNumber}: " . $e->getMessage());
            }
        }
    }

    protected function mapCsvRowToTenantData(array $row, int $rowNumber): array
    {
        $propertyName = trim($row['Property name'] ?? '');
        $unitNumber = trim($row['Unit number'] ?? '');
        $firstName = trim($row['First name'] ?? '');
        $lastName = trim($row['Last name'] ?? '');

        // Skip if essential data is missing
        if (empty($propertyName) || empty($unitNumber) || empty($firstName) || empty($lastName)) {
            $this->warnings[] = "Row {$rowNumber}: Skipped due to missing essential data (property, unit, first name, or last name)";
            return [];
        }

        return [
            'property_name' => $propertyName,
            'unit_number' => $unitNumber,
            'first_name' => $firstName,
            'last_name' => $lastName,
            'street_address_line' => trim($row['Street address line 1'] ?? '') ?: null,
            'login_email' => !empty(trim($row['Login email'] ?? '')) ? trim($row['Login email']) : null,
            'alternate_email' => !empty(trim($row['Alternate email'] ?? '')) ? trim($row['Alternate email']) : null,
            'mobile' => !empty(trim($row['Mobile'] ?? '')) ? trim($row['Mobile']) : null,
            'emergency_phone' => !empty(trim($row['Emergency phone'] ?? '')) ? trim($row['Emergency phone']) : null,
            // Set other fields as null as requested
            'cash_or_check' => null,
            'has_insurance' => null,
            'sensitive_communication' => null,
            'has_assistance' => null,
            'assistance_amount' => null,
            'assistance_company' => null,
        ];
    }

    protected function validateTenantData(array $data, int $rowNumber): array
    {
        $errors = [];
        
        // Validate property exists in PropertyInfoWithoutInsurance
        if (!PropertyInfoWithoutInsurance::where('property_name', $data['property_name'])->exists()) {
            $errors[] = "Row {$rowNumber}: Property '{$data['property_name']}' does not exist in the system";
        }

        // Validate unit exists for the property
        if (!Unit::where('property', $data['property_name'])
                 ->where('unit_name', $data['unit_number'])
                 ->exists()) {
            $errors[] = "Row {$rowNumber}: Unit '{$data['unit_number']}' does not exist for property '{$data['property_name']}'";
        }

        // Validate email formats
        if (!empty($data['login_email']) && !filter_var($data['login_email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Row {$rowNumber}: Invalid login email format: {$data['login_email']}";
        }

        if (!empty($data['alternate_email']) && !filter_var($data['alternate_email'], FILTER_VALIDATE_EMAIL)) {
            $errors[] = "Row {$rowNumber}: Invalid alternate email format: {$data['alternate_email']}";
        }

        // Check for unique login email
        // if (!empty($data['login_email']) && 
        //     Tenant::where('login_email', $data['login_email'])->exists()) {
        //     $errors[] = "Row {$rowNumber}: Login email '{$data['login_email']}' is already in use";
        // }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    protected function isDuplicate(array $tenantData): bool
    {
        return Tenant::where('property_name', $tenantData['property_name'])
            ->where('unit_number', $tenantData['unit_number'])
            ->where('first_name', $tenantData['first_name'])
            ->where('last_name', $tenantData['last_name'])
            ->exists();
    }

    protected function resetCounters(): void
    {
        $this->errors = [];
        $this->warnings = [];
        $this->successCount = 0;
        $this->errorCount = 0;
        $this->duplicateCount = 0;
    }

    protected function generateSuccessMessage(): string
    {
        $message = "Import completed. {$this->successCount} tenants imported successfully";
        
        if ($this->errorCount > 0) {
            $message .= ", {$this->errorCount} errors";
        }
        
        if ($this->duplicateCount > 0) {
            $message .= ", {$this->duplicateCount} duplicates skipped";
        }
        
        return $message . ".";
    }

    public function getImportTemplate(): array
    {
        return [
            'Property name',
            'Unit number',
            'First name',
            'Last name',
            'Street address line 1',
            'Login email',
            'Alternate email',
            'Mobile',
            'Emergency phone'
        ];
    }
}

<?php
namespace App\Services;

use App\Models\OffersAndRenewal;

class OffersAndRenewalService
{
    public function create(array $data): OffersAndRenewal
    {
        $offer = OffersAndRenewal::create($data);
        $offer->calculateExpiry();
        $offer->save();
        return $offer;
    }

    public function update(OffersAndRenewal $offer, array $data): OffersAndRenewal
    {
        $offer->fill($data);
        $offer->calculateExpiry();
        $offer->save();
        return $offer;
    }

    public function delete(OffersAndRenewal $offer): void
    {
        $offer->delete();
    }

    public function listAll()
    {
        return OffersAndRenewal::all();
    }

    public function findById(int $id)
    {
        return OffersAndRenewal::findOrFail($id);
    }
}

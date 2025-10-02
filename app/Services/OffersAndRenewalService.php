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
        $offer->archive();
    }

    public function listAll()
    {
        return OffersAndRenewal::notArchived()->get();
    }

    public function findById(int $id)
    {
        return OffersAndRenewal::notArchived()->findOrFail($id);
    }

    public function listWithArchived()
    {
        return OffersAndRenewal::withArchived()->get();
    }

    public function listOnlyArchived()
    {
        return OffersAndRenewal::onlyArchived()->get();
    }

    public function restore(OffersAndRenewal $offer): OffersAndRenewal
    {
        $offer->restore();
        return $offer;
    }

    public function forceDelete(OffersAndRenewal $offer): void
    {
        $offer->delete();
    }
}

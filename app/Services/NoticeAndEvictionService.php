<?php

namespace App\Services;

use App\Models\NoticeAndEviction;

class NoticeAndEvictionService
{
    public function create(array $data): NoticeAndEviction
    {
        $nev = NoticeAndEviction::create($data);
        $nev->calculateEvictions();
        $nev->save();
        return $nev;
    }

    public function update(NoticeAndEviction $nev, array $data): NoticeAndEviction
    {
        $nev->fill($data);
        $nev->calculateEvictions();
        $nev->save();
        return $nev;
    }

    public function delete(NoticeAndEviction $nev): void
    {
        $nev->delete();
    }

    public function listAll()
    {
        return NoticeAndEviction::all();
    }

    public function findById(int $id)
    {
        return NoticeAndEviction::findOrFail($id);
    }
}

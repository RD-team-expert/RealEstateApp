<?php

namespace App\Services;

use App\Models\Notice;

class NoticeService
{
    public function create(array $data): Notice
    {
        return Notice::create($data);
    }

    public function update(Notice $notice, array $data): Notice
    {
        $notice->fill($data);
        $notice->save();
        return $notice;
    }

    public function delete(Notice $notice): void
    {
        $notice->delete();
    }

    public function listAll()
    {
        return Notice::all();
    }

    public function findById(int $id)
    {
        return Notice::findOrFail($id);
    }
}

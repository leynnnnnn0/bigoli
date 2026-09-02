<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\ReplyToTicketRequest;
use App\Http\Requests\Business\StoreTicketRequest;
use App\Http\Requests\Business\TicketIndexRequest;
use App\Services\TicketService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class TicketController extends Controller
{
    public function index(TicketIndexRequest $request, TicketService $tickets)
    {
        return Inertia::render('Business/Ticket/Index', $tickets->indexData(
            Auth::user()->business,
            $request->validated(),
        ));
    }

    public function store(StoreTicketRequest $request, TicketService $tickets)
    {
        $tickets->create(Auth::user()->business, $request->validated(), $request->file('images', []));

        return back()->with('success', 'Ticket created successfully!');
    }

    public function show(int $id, TicketService $tickets)
    {
        return Inertia::render('Business/Ticket/Show', [
            'ticket' => $tickets->show(Auth::user()->business, $id),
        ]);
    }

    public function reply(ReplyToTicketRequest $request, int $id, TicketService $tickets)
    {
        $tickets->reply(Auth::user()->business, $id, (int) Auth::id(), $request->validated(), $request->file('images', []));

        return back()->with('success', 'Reply added successfully!');
    }
}

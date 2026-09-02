<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\StoreCardTemplateRequest;
use App\Http\Requests\Business\UpdateCardTemplateRequest;
use App\Services\CardTemplateService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CardTempalateController extends Controller
{
    public function index(CardTemplateService $cardTemplates)
    {
        return Inertia::render('Business/CardTemplate/Index', $cardTemplates->indexData(Auth::user()->business));
    }

    public function create(CardTemplateService $cardTemplates)
    {
        return Inertia::render('Business/CardTemplate/Create', $cardTemplates->formData(Auth::user()->business));
    }

    public function store(StoreCardTemplateRequest $request, CardTemplateService $cardTemplates)
    {
        $cardTemplates->create(Auth::user()->business, $request->validated());

        return redirect()->route('card-templates.index')->with('success', 'Card Template created successfully.');
    }

    public function show(int $id, CardTemplateService $cardTemplates)
    {
        return Inertia::render('Business/CardTemplate/Show', [
            'cardTemplate' => $cardTemplates->show(Auth::user()->business, $id),
        ]);
    }

    public function edit(int $id, CardTemplateService $cardTemplates)
    {
        return Inertia::render('Business/CardTemplate/Edit', $cardTemplates->formData(Auth::user()->business, $id));
    }

    public function update(UpdateCardTemplateRequest $request, int $id, CardTemplateService $cardTemplates)
    {
        $cardTemplates->update(Auth::user()->business, $id, $request->validated());

        return redirect()->route('card-templates.index')->with('success', 'Card Template updated successfully.');
    }

    public function destroy(int $id, CardTemplateService $cardTemplates)
    {
        if (Auth::user()->email === 'business@gmail.com') {
            return back()->withErrors(['error' => 'Demo account cannot make changes.']);
        }

        $cardTemplates->delete(Auth::user()->business, $id);

        return redirect()->route('card-templates.index')->with('success', 'Card Template deleted successfully.');
    }
}

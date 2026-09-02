<?php

namespace App\Http\Controllers\Business;

use App\Http\Controllers\Controller;
use App\Http\Requests\Business\CustomerIndexRequest;
use App\Services\CustomerService;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(CustomerIndexRequest $request, CustomerService $customers)
    {
        return Inertia::render('Business/Customer/Index', $customers->pageData(
            Auth::user()->business,
            $request->validated(),
        ));
    }

    public function show(int $id, CustomerService $customers)
    {
        return Inertia::render('Business/Customer/Show', [
            'customer' => $customers->find(Auth::user()->business, $id),
        ]);
    }
}

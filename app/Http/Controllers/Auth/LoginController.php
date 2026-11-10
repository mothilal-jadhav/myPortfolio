<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Validation\ValidationException;

class LoginController extends Controller
{
    public function store(Request $request){
        $credentials = $request->validate(
            [
                "email"=> ['required', 'email'],
                'password'=> ['required','string'],
            ]
        );

        if(! Auth::attempt($credentials)){
            throw ValidationException::withMessages([
                'email'=> 'provided credentials are incorrect...'
            ]);
        }

        $request->session()->regenerate();

        return redirect()->intended(route('admin.dashboard'));
    }
}

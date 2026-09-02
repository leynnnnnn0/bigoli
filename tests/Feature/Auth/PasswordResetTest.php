<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('public business password-reset routes are unavailable', function () {
    $this->get('/forgot-password')->assertNotFound();
    $this->post('/forgot-password', [])->assertNotFound();
    $this->get('/reset-password/example-token')->assertNotFound();
    $this->post('/reset-password', [])->assertNotFound();
});

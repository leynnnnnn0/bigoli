<?php

uses(\Illuminate\Foundation\Testing\RefreshDatabase::class);

test('public business registration is unavailable', function () {
    $this->get('/register')->assertNotFound();
    $this->post('/register', [])->assertNotFound();
});

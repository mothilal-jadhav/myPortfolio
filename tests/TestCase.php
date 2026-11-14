<?php

namespace Tests;

use Illuminate\Foundation\Testing\TestCase as BaseTestCase;

abstract class TestCase extends BaseTestCase
{
    /**
     * Feature tests assert on Inertia props, so they do not need compiled assets.
     */
    protected function setUp(): void
    {
        parent::setUp();

        $this->withoutVite();
    }
}

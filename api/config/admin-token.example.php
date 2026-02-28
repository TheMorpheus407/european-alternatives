<?php
declare(strict_types=1);

// Admin bearer token for the /api/admin/* endpoints.
// Copy this file to /home/u688914453/.secrets/euroalt-admin-token.php
// and replace the value with a long, random token.
//
// Generate one with: openssl rand -hex 32
putenv('EUROALT_ADMIN_TOKEN=replace-with-a-long-random-token');

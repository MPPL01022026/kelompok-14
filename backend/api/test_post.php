<?php

$url = "http://localhost/MPPL/kelompok-14/backend/api/energy_readings.php";

$data = [
    "voltage" => 220,
    "current" => 2.5,
    "power" => 550,
    "energy" => 4.82,
    "cost" => 7230
];

$options = [
    "http" => [
        "header" => "Content-Type: application/json",
        "method" => "POST",
        "content" => json_encode($data)
    ]
];

$context = stream_context_create($options);

$result = file_get_contents($url, false, $context);

echo "<pre>";
print_r(json_decode($result, true));
echo "</pre>";
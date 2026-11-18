<?php
require_once __DIR__ . "/../config/cors.php";

header("Content-Type: application/json; charset=UTF-8");
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json; charset=UTF-8");

require_once __DIR__ . "/../config/database.php";

$method = $_SERVER["REQUEST_METHOD"];

// ==============================
// GET: Mengambil data energi
// ==============================

if ($method === "GET") {

    $query = "
        SELECT *
        FROM energy_readings
        ORDER BY recorded_at DESC
        LIMIT 50
    ";

    $result = mysqli_query($conn, $query);

    if (!$result) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Gagal mengambil data energi"
        ]);

        exit;
    }

    $readings = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $readings[] = $row;
    }

    echo json_encode([
        "success" => true,
        "total" => count($readings),
        "data" => $readings
    ], JSON_PRETTY_PRINT);

    exit;
}

// ==============================
// POST: Menyimpan data energi
// ==============================

if ($method === "POST") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    $fields = [
        "voltage",
        "current",
        "power",
        "energy",
        "cost"
    ];

    foreach ($fields as $field) {

        if (!isset($input[$field]) || !is_numeric($input[$field])) {

            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "Data $field tidak valid"
            ]);

            exit;
        }
    }

    $voltage = (float) $input["voltage"];
    $current = (float) $input["current"];
    $power = (float) $input["power"];
    $energy = (float) $input["energy"];
    $cost = (float) $input["cost"];

    $query = "
        INSERT INTO energy_readings
        (voltage, current, power, energy, cost)
        VALUES (?, ?, ?, ?, ?)
    ";

    $stmt = mysqli_prepare($conn, $query);

    mysqli_stmt_bind_param(
        $stmt,
        "ddddd",
        $voltage,
        $current,
        $power,
        $energy,
        $cost
    );

    if (mysqli_stmt_execute($stmt)) {

        echo json_encode([
            "success" => true,
            "message" => "Data energi berhasil disimpan",
            "id" => mysqli_insert_id($conn)
        ]);

    } else {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Gagal menyimpan data energi"
        ]);
    }

    mysqli_stmt_close($stmt);

    exit;
}

// ==============================
// METHOD TIDAK DIDUKUNG
// ==============================

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method tidak diizinkan"
]);
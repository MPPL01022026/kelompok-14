
<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER["REQUEST_METHOD"];

// =====================================
// GET: Mengambil seluruh data perangkat
// =====================================
if ($method === "GET") {

    $query = "SELECT * FROM devices ORDER BY id ASC";
    $result = mysqli_query($conn, $query);

    if (!$result) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Gagal mengambil data perangkat"
        ]);

        exit;
    }

    $devices = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $devices[] = $row;
    }

    echo json_encode([
        "success" => true,
        "message" => "Data perangkat berhasil diambil",
        "total" => count($devices),
        "data" => $devices
    ], JSON_PRETTY_PRINT);

    exit;
}

// =====================================
// POST: Mengubah status perangkat
// =====================================
if ($method === "POST") {

    $input = json_decode(file_get_contents("php://input"), true);

    $id = isset($input["id"]) ? (int)$input["id"] : 0;
    $status = strtoupper(trim($input["status"] ?? ""));

    if ($id <= 0 || !in_array($status, ["ON", "OFF"], true)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "ID atau status perangkat tidak valid"
        ]);

        exit;
    }

    $query = "UPDATE devices SET status = ? WHERE id = ?";

    $stmt = mysqli_prepare($conn, $query);

    if (!$stmt) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Gagal menyiapkan perubahan status"
        ]);

        exit;
    }

    mysqli_stmt_bind_param($stmt, "si", $status, $id);
    $success = mysqli_stmt_execute($stmt);

    if (!$success) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Gagal mengubah status perangkat"
        ]);

        exit;
    }

    if (mysqli_stmt_affected_rows($stmt) === 0) {
        $check = mysqli_prepare($conn, "SELECT id FROM devices WHERE id = ?");
        mysqli_stmt_bind_param($check, "i", $id);
        mysqli_stmt_execute($check);
        mysqli_stmt_store_result($check);

        if (mysqli_stmt_num_rows($check) === 0) {
            http_response_code(404);

            echo json_encode([
                "success" => false,
                "message" => "Perangkat tidak ditemukan"
            ]);

            exit;
        }
    }

    echo json_encode([
        "success" => true,
        "message" => "Status perangkat berhasil diperbarui",
        "id" => $id,
        "status" => $status
    ]);

    exit;
}

// =====================================
// Method selain GET dan POST
// =====================================
http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method tidak diizinkan"
]);


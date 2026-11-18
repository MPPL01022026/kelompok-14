
<?php

require_once __DIR__ . "/../config/cors.php";
require_once __DIR__ . "/../config/database.php";

header("Content-Type: application/json; charset=UTF-8");

$method = $_SERVER["REQUEST_METHOD"];

// ===================================
// GET: Mengambil riwayat aktivitas
// ===================================

if ($method === "GET") {

    $query = "
        SELECT
            h.id,
            h.energy_reading_id,
            h.activity,
            h.created_at,
            e.voltage,
            e.current,
            e.power,
            e.energy,
            e.cost
        FROM energy_history h
        LEFT JOIN energy_readings e
            ON h.energy_reading_id = e.id
        ORDER BY h.created_at DESC
        LIMIT 50
    ";

    $result = mysqli_query($conn, $query);

    if (!$result) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Gagal mengambil riwayat aktivitas"
        ]);

        exit;
    }

    $history = [];

    while ($row = mysqli_fetch_assoc($result)) {
        $history[] = $row;
    }

    echo json_encode([
        "success" => true,
        "message" => "Riwayat berhasil diambil",
        "total" => count($history),
        "data" => $history
    ], JSON_PRETTY_PRINT);

    exit;
}


// ===================================
// POST: Menambahkan riwayat aktivitas
// ===================================

if ($method === "POST") {

    $input = json_decode(
        file_get_contents("php://input"),
        true
    );

    if (!is_array($input)) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Format data JSON tidak valid"
        ]);

        exit;
    }

    // Validasi aktivitas
    if (
        !isset($input["activity"]) ||
        !is_string($input["activity"]) ||
        trim($input["activity"]) === "" ||
        strlen($input["activity"]) > 255
    ) {
        http_response_code(400);

        echo json_encode([
            "success" => false,
            "message" => "Aktivitas wajib diisi dan maksimal 255 karakter"
        ]);

        exit;
    }

    $activity = trim($input["activity"]);

    // Jika ID pembacaan dikirim, gunakan ID tersebut.
    // Jika tidak, ambil pembacaan energi terbaru.
    if (isset($input["energy_reading_id"])) {

        $readingId = filter_var(
            $input["energy_reading_id"],
            FILTER_VALIDATE_INT
        );

        if (!$readingId || $readingId <= 0) {
            http_response_code(400);

            echo json_encode([
                "success" => false,
                "message" => "ID pembacaan energi tidak valid"
            ]);

            exit;
        }

    } else {

        $latestQuery = "
            SELECT id
            FROM energy_readings
            ORDER BY recorded_at DESC, id DESC
            LIMIT 1
        ";

        $latestResult = mysqli_query($conn, $latestQuery);

        if (!$latestResult || mysqli_num_rows($latestResult) === 0) {
            http_response_code(409);

            echo json_encode([
                "success" => false,
                "message" => "Belum ada pembacaan energi untuk dikaitkan dengan aktivitas"
            ]);

            exit;
        }

        $latestRow = mysqli_fetch_assoc($latestResult);

        $readingId = (int) $latestRow["id"];
    }

    // Simpan aktivitas ke database
    $query = "
        INSERT INTO energy_history
        (energy_reading_id, activity)
        VALUES (?, ?)
    ";

    $stmt = mysqli_prepare($conn, $query);

    if (!$stmt) {
        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Gagal menyiapkan penyimpanan riwayat"
        ]);

        exit;
    }

    mysqli_stmt_bind_param(
        $stmt,
        "is",
        $readingId,
        $activity
    );

    if (mysqli_stmt_execute($stmt)) {

        echo json_encode([
            "success" => true,
            "message" => "Riwayat aktivitas berhasil disimpan",
            "id" => mysqli_insert_id($conn),
            "energy_reading_id" => $readingId,
            "activity" => $activity
        ]);

    } else {

        http_response_code(500);

        echo json_encode([
            "success" => false,
            "message" => "Gagal menyimpan riwayat aktivitas"
        ]);

    }

    mysqli_stmt_close($stmt);

    exit;
}


// ===================================
// METHOD TIDAK DIDUKUNG
// ===================================

http_response_code(405);

echo json_encode([
    "success" => false,
    "message" => "Method tidak diizinkan"
]);
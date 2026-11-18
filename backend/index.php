<?php

require_once __DIR__ . "/config/database.php";

echo "<h1>SMART ENERGY TWIN</h1>";
echo "<p>Backend PHP berhasil dijalankan!</p>";

if ($conn) {
    echo "<p>Koneksi database berhasil!</p>";
    echo "<p>Database: " . $database . "</p>";
}
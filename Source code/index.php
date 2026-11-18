
<?php
session_start();

// Proteksi dashboard: pengguna wajib login
if (!isset($_SESSION['user_id'])) {
    header("Location: login.php");
    exit;
}

$username = $_SESSION['username'] ?? 'Pemilik';
$initial = strtoupper(substr($username, 0, 1));
?>

<!DOCTYPE html>
<html lang="id">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Smart Energy Twin - UMKM</title>
    <link rel="stylesheet" href="style.css">
</head>

<body>

<div class="app">

    <!-- SIDEBAR -->
    <aside class="sidebar">

        <!-- BRAND -->
        <div class="brand">
            <div class="brand-logo">⚡</div>
            <div class="brand-text">
                <h2>EnergyTwin</h2>
                <span>Wadim 08</span>
            </div>
        </div>

        <!-- MENU NAVIGASI -->
        <nav class="sidebar-menu">

            <a href="#dashboard" class="menu-item active">
                <span class="menu-icon">▦</span>
                <span>Dashboard</span>
            </a>

            <a href="#perangkat" class="menu-item">
                <span class="menu-icon">◉</span>
                <span>Perangkat</span>
            </a>

            <a href="#energi" class="menu-item">
                <span class="menu-icon">◌</span>
                <span>Monitoring Energi</span>
            </a>

            <a href="#riwayat" class="menu-item">
                <span class="menu-icon">◷</span>
                <span>Riwayat</span>
            </a>

        </nav>

        <!-- BAGIAN BAWAH SIDEBAR -->
        <div class="sidebar-bottom">

            <!-- STATUS SISTEM -->
            <div class="system-status">

                <span class="status-dot" id="systemDot"></span>

                <div>
                    <strong id="systemText">Menghubungkan...</strong>
                    <small>Smart Energy Meter</small>
                </div>

            </div>

            <!-- INFORMASI AKUN PEMILIK -->
            <div class="account-info">

                <div class="account-avatar">
                    <?= htmlspecialchars($initial) ?>
                </div>

                <div class="account-detail">
                    <strong>
                        <?= htmlspecialchars($username) ?>
                    </strong>

                    <small>Pemilik Warkop</small>
                </div>

            </div>

            <!-- TOMBOL LOGOUT -->
            <a href="logout.php"
               class="logout-button"
               onclick="return confirm('Apakah kamu yakin ingin keluar dari aplikasi?');">

                <span class="logout-icon">↪</span>
                <span>Keluar dari Aplikasi</span>

            </a>

        </div>

    </aside>


    <!-- MAIN CONTENT -->
    <main class="main-content">

        <!-- TOPBAR -->
        <header class="topbar">

            <div class="topbar-left">

                <span class="breadcrumb">
                    Digital Twin / Dashboard
                </span>

                <h1>Smart Energy Twin</h1>

                <p>
                    Monitoring penggunaan energi listrik UMKM
                </p>

            </div>

            <div class="topbar-right">

                <div class="live-badge">
                    <span class="live-dot"></span>
                    LIVE
                </div>

                <div class="date-info">
                    <strong id="currentDate">-</strong>
                    <span id="currentTime">-</span>
                </div>

            </div>

        </header>


        <!-- DASHBOARD -->
        <section id="dashboard">

            <!-- HERO -->
            <div class="hero-card">

                <div class="hero-content">

                    <span class="hero-label">
                        DIGITAL TWIN
                    </span>

                    <h2>Monitoring Energi UMKM</h2>

                    <p>
                        Pantau kondisi penggunaan listrik dan perangkat
                        elektronik UMKM melalui Smart Energy Meter.
                    </p>

                </div>

                <div class="hero-status">

                    <div class="hero-status-icon" id="energyStatusIcon">
                        -
                    </div>

                    <div>
                        <span>Status Sistem</span>
                        <strong id="energyStatus">MEMUAT...</strong>
                    </div>

                </div>

            </div>


            <!-- ENERGY OVERVIEW -->
            <div class="section-header">

                <div>
                    <h2>Energy Overview</h2>
                    <p>Kondisi penggunaan energi saat ini</p>
                </div>

                <span class="update-label">
                    Data Smart Energy Meter
                </span>

            </div>


            <!-- ENERGY CARDS -->
            <div class="energy-cards">

                <!-- TEGANGAN -->
                <div class="energy-card">

                    <div class="card-top">
                        <div class="card-icon voltage-icon">V</div>
                        <span class="card-status">NORMAL</span>
                    </div>

                    <span class="card-title">Tegangan</span>

                    <div class="card-value">
                        <span id="voltage">--</span>
                        <small>V</small>
                    </div>

                    <p>Tegangan listrik</p>

                </div>


                <!-- ARUS -->
                <div class="energy-card">

                    <div class="card-top">
                        <div class="card-icon current-icon">A</div>
                        <span class="card-status">NORMAL</span>
                    </div>

                    <span class="card-title">Arus</span>

                    <div class="card-value">
                        <span id="current">--</span>
                        <small>A</small>
                    </div>

                    <p>Arus listrik</p>

                </div>


                <!-- DAYA -->
                <div class="energy-card">

                    <div class="card-top">
                        <div class="card-icon power-icon">W</div>
                        <span class="card-status">AKTIF</span>
                    </div>

                    <span class="card-title">Daya</span>

                    <div class="card-value">
                        <span id="power">--</span>
                        <small>W</small>
                    </div>

                    <p>Daya listrik saat ini</p>

                </div>


                <!-- ENERGI -->
                <div class="energy-card">

                    <div class="card-top">
                        <div class="card-icon energy-icon">kWh</div>
                        <span class="card-status">HARI INI</span>
                    </div>

                    <span class="card-title">Konsumsi Energi</span>

                    <div class="card-value">
                        <span id="energy">--</span>
                        <small>kWh</small>
                    </div>

                    <p>Total konsumsi hari ini</p>

                </div>

            </div>


            <!-- CONTENT GRID -->
            <div class="content-grid">

                <!-- MONITORING CHART -->
                <div class="panel monitoring-panel">

                    <div class="panel-header">

                        <div>
                            <h3>Monitoring Konsumsi Energi</h3>
                            <p>Grafik penggunaan energi (kWh)</p>
                        </div>

                        <select>
                            <option>Hari Ini</option>
                            <option>Minggu Ini</option>
                            <option>Bulan Ini</option>
                        </select>

                    </div>

                    <div class="chart-area">
                        <canvas id="energyChart"></canvas>
                    </div>

                </div>


                <!-- ESTIMASI BIAYA -->
                <div class="panel cost-panel">

                    <div class="panel-header">

                        <div>
                            <h3>Estimasi Biaya</h3>
                            <p>Perkiraan penggunaan listrik</p>
                        </div>

                        <div class="cost-icon">Rp</div>

                    </div>

                    <div class="cost-content">

                        <span>Estimasi hari ini</span>

                        <h2 id="cost">Rp 0</h2>

                        <p>Berdasarkan konsumsi energi</p>

                    </div>

                    <div class="cost-detail">

                        <div>
                            <span>Konsumsi</span>
                            <strong id="costEnergy">-- kWh</strong>
                        </div>

                        <div>
                            <span>Tarif</span>
                            <strong id="rate">Rp 1.500/kWh</strong>
                        </div>

                    </div>

                </div>

            </div>


            <!-- PERANGKAT -->
            <section id="perangkat">

                <div class="section-header device-header">

                    <div>
                        <h2>Device Monitoring</h2>
                        <p>Perangkat listrik yang digunakan UMKM</p>
                    </div>

                    <span class="device-total" id="deviceTotal">
                        - Perangkat
                    </span>

                </div>

                <!-- Diisi otomatis oleh script.js dari devices.php -->
                <div class="device-grid" id="deviceGrid"></div>

            </section>


            <!-- RINGKASAN PENGGUNAAN -->
            <section id="energi">

                <div class="section-header">

                    <div>
                        <h2>Ringkasan Penggunaan</h2>
                        <p>
                            Informasi jumlah perangkat berdasarkan jenis
                        </p>
                    </div>

                </div>

                <div class="summary-table">

                    <div class="table-header">
                        <span>Perangkat</span>
                        <span>Jumlah</span>
                        <span>Status</span>
                        <span>Perkiraan Daya</span>
                    </div>

                    <!-- Diisi otomatis oleh script.js -->
                    <div id="summaryRows"></div>

                </div>

            </section>


            <!-- RIWAYAT AKTIVITAS -->
            <section id="riwayat">

                <div class="section-header">

                    <div>
                        <h2>System Activity</h2>
                        <p>Informasi aktivitas sistem</p>
                    </div>

                </div>

                <!-- Diisi otomatis oleh script.js dari energy_history.php -->
                <div class="activity-panel" id="activityList"></div>

            </section>

        </section>


        <!-- FOOTER -->
        <footer>

            <span>Smart Energy Twin © 2026</span>

            <span>
                Digital Twin • Smart Energy Meter • UMKM
            </span>

        </footer>

    </main>

</div>


<!-- STYLE TAMBAHAN UNTUK AKUN DAN LOGOUT -->
<style>

    .sidebar-bottom {
        margin-top: auto;
        padding: 15px;
        width: 100%;
    }

    .account-info {
        display: flex;
        align-items: center;
        gap: 10px;
        padding: 15px 5px;
        margin-top: 12px;
        border-top: 1px solid rgba(128, 150, 150, 0.2);
    }

    .account-avatar {
        width: 38px;
        height: 38px;
        min-width: 38px;
        border-radius: 50%;
        background: #d9f3ef;
        color: #0f766e;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 15px;
        font-weight: 700;
    }

    .account-detail {
        flex: 1;
        min-width: 0;
        display: flex;
        flex-direction: column;
        gap: 4px;
    }

    .account-detail strong {
        font-size: 12px;
        color: #173b46;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .account-detail small {
        font-size: 10px;
        color: #82939a;
    }

    .logout-button {
        display: flex;
        align-items: center;
        justify-content: center;
        gap: 9px;
        width: 100%;
        padding: 12px;
        border-radius: 9px;
        background: #fff1f1;
        color: #dc2626;
        text-decoration: none;
        font-size: 13px;
        font-weight: 700;
        transition: 0.2s;
    }

    .logout-button:hover {
        background: #fee2e2;
        transform: translateY(-1px);
    }

    .logout-icon {
        font-size: 18px;
    }

</style>


<!-- MENU AKTIF SAAT DIKLIK / DI-SCROLL -->
<script>

document.addEventListener("DOMContentLoaded", function () {

    const menuItems = document.querySelectorAll(
        ".sidebar-menu .menu-item"
    );

    const sections = [
        document.getElementById("dashboard"),
        document.getElementById("perangkat"),
        document.getElementById("energi"),
        document.getElementById("riwayat")
    ];

    // Menu aktif ketika diklik
    menuItems.forEach(function (menu) {

        menu.addEventListener("click", function () {

            menuItems.forEach(function (item) {
                item.classList.remove("active");
            });

            this.classList.add("active");

        });

    });


    // Menu aktif mengikuti posisi scroll
    window.addEventListener("scroll", function () {

        let currentSection = "";

        sections.forEach(function (section) {

            if (
                section &&
                window.scrollY + 180 >= section.offsetTop
            ) {
                currentSection = section.getAttribute("id");
            }

        });

        menuItems.forEach(function (menu) {

            menu.classList.remove("active");

            if (
                menu.getAttribute("href") === "#" + currentSection
            ) {
                menu.classList.add("active");
            }

        });

    });

});

</script>


<!-- CHART.JS -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- SCRIPT UTAMA DASHBOARD -->
<script src="script.js"></script>

</body>
</html>

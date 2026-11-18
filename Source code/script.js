
/* =====================================================
   SMART ENERGY TWIN
   Frontend Integration - PHP + MySQL
   Digital Twin berbasis simulasi perangkat
===================================================== */

/* =========================
   KONFIGURASI API
========================= */

const API_BASE = "http://localhost/MPPL/kelompok-14/backend/api";

const API = {
    devices: `${API_BASE}/devices.php`,
    readings: `${API_BASE}/energy_readings.php`,
    history: `${API_BASE}/energy_history.php`
};

const REFRESH_MS = 5000;
const MAX_POINTS = 12;
const ELECTRICITY_RATE = 1500;


/* =========================
   VARIABEL GLOBAL
========================= */

const $ = (id) => document.getElementById(id);

let devicesData = [];

let voltage = 220;
let current = 0;
let totalPower = 0;
let totalEnergy = 0;

let energyChart = null;
let simulationTimer = null;


/* =========================
   HELPER
========================= */

const esc = (value) =>
    String(value ?? "").replace(/[&<>"']/g, (char) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    }[char]));

const rupiah = (value) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0
    }).format(Number(value) || 0);

const numberFormat = (value, digits = 2) =>
    (Number(value) || 0).toFixed(digits);

function setText(id, value) {
    const element = $(id);
    if (element) element.textContent = value;
}

function parseDate(value) {
    return new Date(String(value).replace(" ", "T"));
}

function formatTime(value) {
    return parseDate(value).toLocaleTimeString("id-ID", {
        hour: "2-digit",
        minute: "2-digit"
    });
}


/* =========================
   REQUEST API
========================= */

async function requestJSON(url, options = {}) {
    const response = await fetch(url, options);

    const raw = await response.text();

    let json;

    try {
        json = JSON.parse(raw);
    } catch {
        throw new Error("Respons server bukan JSON yang valid.");
    }

    if (!response.ok || !json.success) {
        throw new Error(
            json.message || `Terjadi kesalahan HTTP ${response.status}`
        );
    }

    return json;
}

async function getJSON(url) {
    return requestJSON(url);
}

async function postJSON(url, data) {
    return requestJSON(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(data)
    });
}


/* =========================
   GRAFIK ENERGI
========================= */

function initializeChart() {
    const canvas = $("energyChart");

    if (!canvas || typeof Chart === "undefined") {
        console.warn("Canvas atau Chart.js tidak ditemukan.");
        return;
    }

    const ctx = canvas.getContext("2d");

    const gradient = ctx.createLinearGradient(0, 0, 0, 280);

    gradient.addColorStop(0, "rgba(15, 118, 110, 0.20)");
    gradient.addColorStop(1, "rgba(15, 118, 110, 0.00)");

    energyChart = new Chart(ctx, {
        type: "line",

        data: {
            labels: [],

            datasets: [{
                label: "Konsumsi Energi (kWh)",
                data: [],
                borderColor: "#0f766e",
                backgroundColor: gradient,
                borderWidth: 2,
                fill: true,
                tension: 0.4,
                pointRadius: 3,
                pointBackgroundColor: "#0f766e"
            }]
        },

        options: {
            responsive: true,
            maintainAspectRatio: false,

            plugins: {
                legend: {
                    display: false
                }
            },

            scales: {
                y: {
                    beginAtZero: false,
                    grid: {
                        color: "#edf1f1"
                    },
                    ticks: {
                        color: "#8b9999",
                        font: {
                            size: 10
                        }
                    }
                },

                x: {
                    grid: {
                        display: false
                    },
                    ticks: {
                        color: "#8b9999",
                        font: {
                            size: 10
                        }
                    }
                }
            }
        }
    });
}

function addChartPoint(label, value) {
    if (!energyChart) return;

    energyChart.data.labels.push(label);

    energyChart.data.datasets[0].data.push(
        Number(value) || 0
    );

    while (energyChart.data.labels.length > MAX_POINTS) {
        energyChart.data.labels.shift();
        energyChart.data.datasets[0].data.shift();
    }

    energyChart.update("none");
}


/* =========================
   STATUS KONEKSI
========================= */

function setConnection(online) {
    const text = $("systemText");
    const dot = $("systemDot");

    if (text) {
        text.textContent = online
            ? "System Online"
            : "Backend Offline";
    }

    if (dot) {
        dot.style.background = online ? "#16a34a" : "#dc2626";

        dot.style.boxShadow = online
            ? "0 0 0 4px #dcfce7"
            : "0 0 0 4px #fee2e2";
    }
}


/* =========================
   STATUS ENERGI
========================= */

function setEnergyStatus(power) {
    const text = $("energyStatus");
    const icon = $("energyStatusIcon");

    if (!text || !icon) return;

    if (power === null) {
        text.textContent = "BELUM ADA DATA";
        icon.textContent = "-";
        icon.style.color = "#64748b";
        icon.style.background = "#e2e8f0";
    }

    else if (power < 500) {
        text.textContent = "NORMAL";
        icon.textContent = "✓";
        icon.style.color = "#16a34a";
        icon.style.background = "#dcfce7";
    }

    else if (power < 700) {
        text.textContent = "TINGGI";
        icon.textContent = "!";
        icon.style.color = "#ca8a04";
        icon.style.background = "#fef3c7";
    }

    else {
        text.textContent = "SANGAT TINGGI";
        icon.textContent = "!";
        icon.style.color = "#dc2626";
        icon.style.background = "#fee2e2";
    }
}


/* =========================
   HITUNG DAYA PERANGKAT
========================= */

function getActivePower() {
    return devicesData.reduce((total, device) => {

        const status = String(device.status).toUpperCase();

        if (status === "ON") {
            return total + Number(device.estimated_power || 0);
        }

        return total;

    }, 0);
}

function updateDevicePower() {
    totalPower = getActivePower();

    current = voltage > 0
        ? totalPower / voltage
        : 0;

    setText("voltage", numberFormat(voltage, 1));
    setText("current", numberFormat(current));
    setText("power", Math.round(totalPower));

    setEnergyStatus(totalPower);
}


/* =========================
   LOAD: DEVICES
========================= */

async function loadDevices() {
    const json = await getJSON(API.devices);

    if (!Array.isArray(json.data)) {
        throw new Error("Format data perangkat tidak sesuai.");
    }

    devicesData = json.data;

    renderDevices();

    updateDevicePower();
}


/* =========================
   RENDER KARTU PERANGKAT
========================= */

function renderDevices() {
    const grid = $("deviceGrid");
    const summary = $("summaryRows");
    const totalElement = $("deviceTotal");

    if (!grid || !summary) return;

    const iconByName = {
        kulkas: "K",
        tv: "TV",
        dispenser: "D",
        kipas: "K",
        freezer: "F",
        lampu: "L"
    };

    let totalUnits = 0;

    grid.innerHTML = "";
    summary.innerHTML = "";

    devicesData.forEach(device => {

        const id = Number(device.id);
        const name = device.device_name || "Perangkat";
        const category = device.category || "Elektronik";
        const quantity = Number(device.quantity) || 0;
        const power = Number(device.estimated_power) || 0;

        const isOn = String(device.status).toUpperCase() === "ON";

        const activePower = isOn ? power : 0;

        totalUnits += quantity;

        const icon = iconByName[name.toLowerCase()]
            || name.charAt(0).toUpperCase();

        /* KARTU PERANGKAT */

        const card = document.createElement("div");

        card.className = "device-card";

        card.innerHTML = `
            <div class="device-card-top">

                <div class="device-icon">
                    ${esc(icon)}
                </div>

                <span class="device-on"
                    style="
                        background:${isOn ? "#dcfce7" : "#fee2e2"};
                        color:${isOn ? "#16a34a" : "#dc2626"};
                    ">
                    ${isOn ? "ON" : "OFF"}
                </span>

            </div>

            <h3>${esc(name)}</h3>

            <p>Perangkat ${esc(category)}</p>

            <div class="device-count">
                <strong>${quantity}</strong>
                <span>Unit</span>
            </div>

            <div class="device-power">
                Daya terpantau
                <strong>${activePower} W</strong>
            </div>

            <button
                type="button"
                class="device-toggle"
                data-device-id="${id}"
                style="
                    width:100%;
                    margin-top:16px;
                    padding:10px;
                    border:0;
                    border-radius:8px;
                    cursor:pointer;
                    font-weight:600;
                    background:${isOn ? "#fee2e2" : "#dcfce7"};
                    color:${isOn ? "#dc2626" : "#16a34a"};
                ">
                ${isOn ? "Matikan Perangkat" : "Nyalakan Perangkat"}
            </button>
        `;

        grid.appendChild(card);


        /* TABEL RINGKASAN */

        const row = document.createElement("div");

        row.className = "table-row";

        row.innerHTML = `
            <span>${esc(name)}</span>

            <strong>${quantity} Unit</strong>

            <span class="table-status">
                ${isOn ? "Aktif" : "Nonaktif"}
            </span>

            <strong>${activePower} W</strong>
        `;

        summary.appendChild(row);

    });

    if (totalElement) {
        totalElement.textContent = `${totalUnits} Perangkat`;
    }
}


/* =========================
   EVENT TOMBOL ON / OFF
========================= */

async function toggleDevice(id, button) {

    const device = devicesData.find(
        item => Number(item.id) === Number(id)
    );

    if (!device) return;

    const currentStatus = String(device.status).toUpperCase();

    const newStatus = currentStatus === "ON"
        ? "OFF"
        : "ON";

    button.disabled = true;
    button.textContent = "Memproses...";

    try {

        const result = await postJSON(API.devices, {
            id: Number(id),
            status: newStatus
        });

        if (!result.success) {
            throw new Error("Status perangkat gagal diperbarui.");
        }

        device.status = newStatus;

renderDevices();

updateDevicePower();

const activityMessage =
    `${device.device_name} berhasil ${newStatus === "ON" ? "dinyalakan" : "dimatikan"}.`;

showActivity(activityMessage);

// Simpan aktivitas ke database.
try {
    await postJSON(API.history, {
        activity: activityMessage
    });

} catch (historyError) {
    console.error(
        "Gagal menyimpan riwayat perangkat:",
        historyError
    );
}


    } catch (error) {

        console.error("Gagal mengubah perangkat:", error);

        alert("Gagal mengubah status perangkat: " + error.message);

        await loadDevices();

    }
}


/* Event delegation tombol perangkat */

document.addEventListener("click", function(event) {

    const button = event.target.closest(".device-toggle");

    if (!button || button.disabled) return;

    const id = button.dataset.deviceId;

    toggleDevice(id, button);

});


/* =========================
   LOAD: ENERGY READINGS
========================= */

async function loadReadings() {
    const json = await getJSON(API.readings);

    const rows = json.data || [];

    if (rows.length === 0) {
        setText("voltage", "--");
        setText("current", "--");
        setText("power", "--");
        setText("energy", "--");
        setText("costEnergy", "--");
        setText("cost", "Rp 0");

        setEnergyStatus(null);

        return;
    }

    const latest = rows[0];

    voltage = Number(latest.voltage) || 220;
    totalEnergy = Number(latest.energy) || 0;

    current = Number(latest.current) || 0;

    setText("voltage", numberFormat(voltage, 1));
    setText("current", numberFormat(current));
    setText("power", Math.round(Number(latest.power) || 0));

    setText("energy", numberFormat(totalEnergy));
    setText("costEnergy", numberFormat(totalEnergy) + " kWh");

    setText(
        "cost",
        rupiah(Number(latest.cost) || totalEnergy * ELECTRICITY_RATE)
    );

    setText("rate", rupiah(ELECTRICITY_RATE) + "/kWh");

    setEnergyStatus(Number(latest.power) || 0);

    if (energyChart) {

        const points = rows.slice(0, MAX_POINTS).reverse();

        energyChart.data.labels = points.map(
            item => formatTime(item.recorded_at)
        );

        energyChart.data.datasets[0].data = points.map(
            item => Number(item.energy)
        );

        energyChart.update("none");
    }
}


/* =========================
   SIMULASI ENERGI
========================= */

async function simulateEnergy() {

    voltage = 218 + Math.random() * 5;

    totalPower = getActivePower();

    current = voltage > 0
        ? totalPower / voltage
        : 0;

    // Interval simulasi 5 detik.
    // Energi dihitung dalam kWh.
    totalEnergy += (
        totalPower * (REFRESH_MS / 1000)
    ) / 3600000;

    const cost = totalEnergy * ELECTRICITY_RATE;

    const reading = {
        voltage: Number(voltage.toFixed(2)),
        current: Number(current.toFixed(2)),
        power: Number(totalPower.toFixed(2)),
        energy: Number(totalEnergy.toFixed(4)),
        cost: Number(cost.toFixed(2))
    };

    // Perbarui tampilan dashboard.
    setText("voltage", numberFormat(voltage, 1));
    setText("current", numberFormat(current));
    setText("power", Math.round(totalPower));

    setText("energy", numberFormat(totalEnergy));
    setText("costEnergy", numberFormat(totalEnergy) + " kWh");

    setText("cost", rupiah(cost));
    setText("rate", rupiah(ELECTRICITY_RATE) + "/kWh");

    setEnergyStatus(totalPower);

    addChartPoint(
        new Date().toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
        }),
        totalEnergy
    );

    // Simpan hasil simulasi ke database.
    try {

        await postJSON(API.readings, reading);

    } catch (error) {

        console.error("Gagal menyimpan simulasi energi:", error);

    }
}


/* =========================
   LOAD: HISTORY
========================= */

async function loadHistory() {
    const json = await getJSON(API.history);

    const items = (json.data || []).slice(0, 5);

    const panel = $("activityList");

    if (!panel) return;

    if (items.length === 0) {

        panel.innerHTML = `
            <div class="activity-item">
                <span class="activity-dot"></span>

                <div>
                    <strong>Belum ada aktivitas</strong>
                    <span>Riwayat akan muncul setelah data dicatat</span>
                </div>
            </div>
        `;

        return;
    }

    panel.innerHTML = items.map(item => `
        <div class="activity-item">

            <span class="activity-dot"></span>

            <div>
                <strong>${esc(item.activity)}</strong>

                <span>
                    ${esc(
                        parseDate(item.created_at).toLocaleString("id-ID")
                    )}
                </span>
            </div>

        </div>
    `).join("");
}


/* =========================
   CATAT AKTIVITAS
========================= */

function showActivity(message) {
    const panel = $("activityList");

    if (!panel) return;

    const item = document.createElement("div");

    item.className = "activity-item";

    const dot = document.createElement("span");
    dot.className = "activity-dot";

    const content = document.createElement("div");

    const title = document.createElement("strong");
    title.textContent = message;

    const detail = document.createElement("span");
    detail.textContent = new Date().toLocaleString("id-ID");

    content.append(title, detail);
    item.append(dot, content);

    panel.prepend(item);

    while (panel.children.length > 10) {
        panel.lastElementChild.remove();
    }
}


/* =========================
   TANGGAL DAN JAM
========================= */

function updateDateTime() {

    const now = new Date();

    setText(
        "currentDate",
        now.toLocaleDateString("id-ID", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric"
        })
    );

    setText(
        "currentTime",
        now.toLocaleTimeString("id-ID", {
            hour: "2-digit",
            minute: "2-digit"
        }) + " WIB"
    );
}


/* =========================
   REFRESH DATA
========================= */

async function refreshAll() {

    try {

        await Promise.all([
            loadDevices(),
            loadReadings(),
            loadHistory()
        ]);

        setConnection(true);

    } catch (error) {

        console.error(
            "Gagal mengambil data dari backend:",
            error
        );

        setConnection(false);

    }
}


/* =========================
   START APPLICATION
========================= */

async function startApplication() {

    updateDateTime();

    setInterval(updateDateTime, 1000);

    initializeChart();

    // Ambil data awal dari database.
    await refreshAll();

    // Jalankan simulasi energi secara berkala.
    if (simulationTimer) {
        clearInterval(simulationTimer);
    }

    await simulateEnergy();

    simulationTimer = setInterval(
        simulateEnergy,
        REFRESH_MS
    );

    // Periksa perubahan perangkat dan riwayat secara berkala.
    setInterval(async () => {

        try {

            await loadDevices();
            await loadHistory();

            setConnection(true);

        } catch (error) {

            console.error("Gagal memperbarui data:", error);

            setConnection(false);

        }

    }, REFRESH_MS * 3);
}


/* Jalankan setelah HTML selesai dimuat */

document.addEventListener("DOMContentLoaded", startApplication);
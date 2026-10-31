/* =====================================================
   SMART ENERGY TWIN
   Simulasi Smart Energy Meter
===================================================== */


/* =========================
   DATA AWAL
========================= */

let voltage = 220.0;
let current = 2.0;
let energy = 4.82;

const electricityRate = 1500;


/* =========================
   ELEMENT
========================= */

const voltageElement =
    document.getElementById("voltage");

const currentElement =
    document.getElementById("current");

const powerElement =
    document.getElementById("power");

const energyElement =
    document.getElementById("energy");

const costElement =
    document.getElementById("cost");

const costEnergyElement =
    document.getElementById("costEnergy");

const energyStatus =
    document.getElementById("energyStatus");

const machinePower =
    document.getElementById("machinePower");

const freezerPower =
    document.getElementById("freezerPower");

const fridgePower =
    document.getElementById("fridgePower");

const activityTime =
    document.getElementById("activityTime");


/* =========================
   CHART DATA
========================= */

const labels = [
    "10:00",
    "10:05",
    "10:10",
    "10:15",
    "10:20",
    "10:25",
    "10:30",
    "10:35"
];

const energyData = [
    2.4,
    2.8,
    3.1,
    3.7,
    4.0,
    4.3,
    4.5,
    4.82
];


/* =========================
   CHART
========================= */

const ctx =
    document
        .getElementById("energyChart")
        .getContext("2d");

const gradient =
    ctx.createLinearGradient(
        0,
        0,
        0,
        280
    );

gradient.addColorStop(
    0,
    "rgba(15, 118, 110, 0.20)"
);

gradient.addColorStop(
    1,
    "rgba(15, 118, 110, 0.00)"
);


const energyChart =
    new Chart(ctx, {

        type: "line",

        data: {

            labels: labels,

            datasets: [

                {

                    label:
                        "Konsumsi Energi",

                    data:
                        energyData,

                    borderColor:
                        "#0f766e",

                    backgroundColor:
                        gradient,

                    borderWidth: 2,

                    fill: true,

                    tension: 0.4,

                    pointRadius: 3,

                    pointBackgroundColor:
                        "#0f766e"

                }

            ]

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
                        color:
                            "#edf1f1"
                    },

                    ticks: {

                        color:
                            "#8b9999",

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

                        color:
                            "#8b9999",

                        font: {
                            size: 10
                        }

                    }

                }

            }

        }

    });


/* =========================
   UPDATE SENSOR
========================= */

function updateSensor() {

    /*
        Simulasi tegangan.
        Nilai bergerak di sekitar 220 V.
    */

    voltage =
        218 +
        Math.random() * 5;


    /*
        Simulasi arus.
        Nilai bergerak antara
        sekitar 1.5 - 3.5 A.
    */

    current =
        1.5 +
        Math.random() * 2;


    /*
        Rumus daya:

        P = V × I
    */

    const power =
        voltage * current;


    /*
        Penambahan energi
        secara simulasi.
    */

    energy +=
        power /
        3600000;


    /*
        Estimasi biaya
    */

    const cost =
        energy *
        electricityRate;


    /*
        Tampilkan ke dashboard
    */

    voltageElement.textContent =
        voltage.toFixed(1);

    currentElement.textContent =
        current.toFixed(2);

    powerElement.textContent =
        Math.round(power);

    energyElement.textContent =
        energy.toFixed(2);

    costEnergyElement.textContent =
        energy.toFixed(2);

    costElement.textContent =
        formatRupiah(cost);


    /*
        Update perangkat
    */

    updateDevices(power);


    /*
        Update status
    */

    updateEnergyStatus(power);


    /*
        Update grafik
    */

    updateChart(energy);


    /*
        Update activity
    */

    activityTime.textContent =
        "Diperbarui " +
        new Date().toLocaleTimeString(
            "id-ID"
        );

}


/* =========================
   DEVICE SIMULATION
========================= */

function updateDevices(power) {

    /*
        Mesin produksi
    */

    const machine =
        Math.max(
            300,
            Math.round(
                power * 0.45
            )
        );

    machinePower.textContent =
        machine;


    /*
        Freezer
    */

    const freezer =
        Math.round(
            280 +
            Math.random() * 80
        );

    freezerPower.textContent =
        freezer;


    /*
        Kulkas
    */

    const fridge =
        Math.round(
            150 +
            Math.random() * 60
        );

    fridgePower.textContent =
        fridge;

}


/* =========================
   ENERGY STATUS
========================= */

function updateEnergyStatus(power) {

    const statusStrong =
        energyStatus.querySelector(
            "strong"
        );

    const statusIcon =
        energyStatus.querySelector(
            ".status-icon"
        );


    if (power < 500) {

        statusStrong.textContent =
            "NORMAL";

        statusIcon.textContent =
            "✓";

        statusIcon.style.color =
            "#16a34a";

        statusIcon.style.background =
            "#dcfce7";

    }

    else if (power < 700) {

        statusStrong.textContent =
            "TINGGI";

        statusIcon.textContent =
            "!";

        statusIcon.style.color =
            "#ca8a04";

        statusIcon.style.background =
            "#fef3c7";

    }

    else {

        statusStrong.textContent =
            "SANGAT TINGGI";

        statusIcon.textContent =
            "!";

        statusIcon.style.color =
            "#dc2626";

        statusIcon.style.background =
            "#fee2e2";

    }

}


/* =========================
   UPDATE CHART
========================= */

function updateChart(value) {

    const now =
        new Date();

    const time =
        now.toLocaleTimeString(
            "id-ID",
            {
                hour: "2-digit",
                minute: "2-digit",
                second: "2-digit"
            }
        );


    energyChart.data.labels.push(
        time
    );

    energyChart.data.datasets[0].data.push(
        Number(value.toFixed(2))
    );


    /*
        Batasi jumlah data
        agar grafik tidak terlalu panjang.
    */

    if (
        energyChart.data.labels.length >
        12
    ) {

        energyChart.data.labels.shift();

        energyChart.data.datasets[0]
            .data.shift();

    }


    energyChart.update(
        "none"
    );

}


/* =========================
   FORMAT RUPIAH
========================= */

function formatRupiah(value) {

    return new Intl.NumberFormat(
        "id-ID",
        {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0
        }
    ).format(value);

}


/* =========================
   DATE & TIME
========================= */

function updateDateTime() {

    const now =
        new Date();


    document.getElementById(
        "currentDate"
    ).textContent =
        now.toLocaleDateString(
            "id-ID",
            {
                weekday: "long",
                day: "numeric",
                month: "long",
                year: "numeric"
            }
        );


    document.getElementById(
        "currentTime"
    ).textContent =
        now.toLocaleTimeString(
            "id-ID"
        );

}


/* =========================
   START SYSTEM
========================= */

updateDateTime();

setInterval(
    updateDateTime,
    1000
);


/*
    Update sensor setiap 3 detik.
*/

setInterval(
    updateSensor,
    3000
);
// Arrays to hold the chart data
let cpuData = [];
let ramData = [];
let diskData = [];
let bandwidthData = [];

const maxDataPoints = 24 * 60; // Maximum data points for 24 hours (1 point per minute)

// Function to add data to the charts
function addDataPoint(chart, dataArray, label, data) {
  if (dataArray.length >= maxDataPoints) {
    dataArray.shift(); // Remove the oldest data point
    chart.data.labels.shift(); // Remove the oldest label
  }
  dataArray.push(data);
  chart.data.labels.push(label);
  chart.update();
}

// Function to update the charts with the new stats
function updateCharts(stats) {
  const now = new Date().toLocaleTimeString();

  addDataPoint(cpuChart, cpuData, now, stats.cpu);
  addDataPoint(ramChart, ramData, now, stats.ram);
  addDataPoint(diskChart, diskData, now, stats.disk);
  addDataPoint(bandwidthChart, bandwidthData, now, stats.bandwidth);
}

// Function to fetch stats from the server
async function fetchStats() {
  const response = await fetch("/api/stats");
  const data = await response.json();
  document.getElementById("cpu").innerText = `${data.cpu}%`;
  document.getElementById("ram").innerText = `${data.ram}%`;
  document.getElementById("disk").innerText = `${data.disk}%`;
  document.getElementById("bandwidth").innerText = `${data.bandwidth} Mbps`;

  updateCharts(data);
}
async function getUserData() {
  const response = await fetch("/api/userAPI");
  const data = await response.json();
  document.getElementById(
    "usernamePlaceholder"
  ).innerText = `Login as ${data.username}`;
}
getUserData();
// Chart.js configurations
const cpuChart = new Chart(document.getElementById("cpuChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "CPU Usage (%)",
        data: cpuData,
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  },
  options: {
    scales: {
      x: { display: true, title: { display: true, text: "Time" } },
      y: { display: true, title: { display: true, text: "%" } },
    },
  },
});

const ramChart = new Chart(document.getElementById("ramChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "RAM Usage (%)",
        data: ramData,
        borderColor: "rgba(54, 162, 235, 1)",
        backgroundColor: "rgba(54, 162, 235, 0.2)",
        fill: true,
      },
    ],
  },
  options: {
    scales: {
      x: { display: true, title: { display: true, text: "Time" } },
      y: { display: true, title: { display: true, text: "%" } },
    },
  },
});

const diskChart = new Chart(document.getElementById("diskChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Disk Usage (%)",
        data: diskData,
        borderColor: "rgba(75, 192, 192, 1)",
        backgroundColor: "rgba(75, 192, 192, 0.2)",
        fill: true,
      },
    ],
  },
  options: {
    scales: {
      x: { display: true, title: { display: true, text: "Time" } },
      y: { display: true, title: { display: true, text: "%" } },
    },
  },
});

const bandwidthChart = new Chart(document.getElementById("bandwidthChart"), {
  type: "line",
  data: {
    labels: [],
    datasets: [
      {
        label: "Bandwidth (Mbps)",
        data: bandwidthData,
        borderColor: "rgba(153, 102, 255, 1)",
        backgroundColor: "rgba(153, 102, 255, 0.2)",
        fill: true,
      },
    ],
  },
  options: {
    scales: {
      x: { display: true, title: { display: true, text: "Time" } },
      y: { display: true, title: { display: true, text: "Mbps" } },
    },
  },
});

// Fetch stats every second
setInterval(fetchStats, 1000);

// Navigation menu functionality
const navBtn = document.getElementById("nav-btn");
const navMenu = document.getElementById("nav-menu");
const closeBtn = document.getElementById("close-btn");

navBtn.addEventListener("click", () => {
  navMenu.style.left = "0";
});

closeBtn.addEventListener("click", () => {
  navMenu.style.left = "-100%";
});

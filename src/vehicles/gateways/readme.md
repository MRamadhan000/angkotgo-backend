<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />

  <title>Vehicle WebSocket Test - 176</title>

  <!-- Socket.IO Client -->
  <script src="https://cdn.socket.io/4.8.1/socket.io.min.js"></script>

  <style>
    * {
      box-sizing: border-box;
    }

    body {
      margin: 0;
      padding: 30px;
      font-family: Arial, sans-serif;
      background: #f4f6f8;
      color: #222;
    }

    .container {
      max-width: 900px;
      margin: 0 auto;
    }

    .card {
      background: white;
      border-radius: 12px;
      padding: 20px;
      margin-bottom: 20px;
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
    }

    h1 {
      margin-top: 0;
    }

    h2 {
      margin-top: 0;
      font-size: 18px;
    }

    .status {
      display: inline-block;
      padding: 8px 14px;
      border-radius: 20px;
      font-weight: bold;
      margin-bottom: 15px;
    }

    .connecting {
      background: #fff3cd;
      color: #856404;
    }

    .connected {
      background: #d4edda;
      color: #155724;
    }

    .disconnected {
      background: #f8d7da;
      color: #721c24;
    }

    .info-grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .info {
      background: #f7f7f7;
      padding: 15px;
      border-radius: 8px;
    }

    .label {
      font-size: 12px;
      color: #777;
      margin-bottom: 5px;
    }

    .value {
      font-weight: bold;
      word-break: break-word;
    }

    pre {
      margin: 0;
      background: #111;
      color: #00ff88;
      padding: 20px;
      border-radius: 8px;
      overflow-x: auto;
      min-height: 150px;
      font-size: 14px;
    }

    #logs {
      height: 300px;
      overflow-y: auto;
      background: #111;
      color: #00ff88;
      padding: 15px;
      border-radius: 8px;
      font-family: monospace;
      font-size: 13px;
    }

    .log {
      margin-bottom: 8px;
      border-bottom: 1px solid #333;
      padding-bottom: 8px;
    }

    .success {
      color: #00ff88;
    }

    .error {
      color: #ff5555;
    }

    .info-log {
      color: #55aaff;
    }

    @media (max-width: 600px) {
      body {
        padding: 15px;
      }

      .info-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
</head>

<body>

<div class="container">

  <!-- HEADER -->
  <div class="card">
    <h1>🚐 Vehicle WebSocket Test</h1>

    <p>
      Testing realtime vehicle tracking menggunakan
      <strong>Socket.IO</strong>.
    </p>

    <div id="connectionStatus" class="status connecting">
      🟡 Connecting...
    </div>

    <div class="info-grid">

      <div class="info">
        <div class="label">
          Backend
        </div>

        <div class="value">
          http://localhost:3001
        </div>
      </div>

      <div class="info">
        <div class="label">
          Vehicle Assignment ID
        </div>

        <div class="value">
          176
        </div>
      </div>

      <div class="info">
        <div class="label">
          Room
        </div>

        <div class="value">
          assignment:176
        </div>
      </div>

      <div class="info">
        <div class="label">
          Socket ID
        </div>

        <div class="value" id="socketId">
          -
        </div>
      </div>

    </div>
  </div>


  <!-- VEHICLE DATA -->
  <div class="card">

    <h2>📍 Latest Vehicle Location</h2>

    <div class="info-grid">

      <div class="info">
        <div class="label">
          Latitude
        </div>

        <div class="value" id="latitude">
          -
        </div>
      </div>

      <div class="info">
        <div class="label">
          Longitude
        </div>

        <div class="value" id="longitude">
          -
        </div>
      </div>

      <div class="info">
        <div class="label">
          Current Stop ID
        </div>

        <div class="value" id="currentStopId">
          -
        </div>
      </div>

      <div class="info">
        <div class="label">
          Stop Status
        </div>

        <div class="value" id="stopStatus">
          -
        </div>
      </div>

      <div class="info">
        <div class="label">
          Vehicle Assignment ID
        </div>

        <div class="value" id="vehicleAssignmentId">
          -
        </div>
      </div>

      <div class="info">
        <div class="label">
          Last Updated
        </div>

        <div class="value" id="createdAt">
          -
        </div>
      </div>

    </div>

  </div>


  <!-- RAW PAYLOAD -->
  <div class="card">

    <h2>📦 Latest Payload</h2>

    <pre id="vehicleData">Belum menerima data...</pre>

  </div>


  <!-- LOG -->
  <div class="card">

    <h2>📋 Socket Logs</h2>

    <div id="logs"></div>

  </div>

</div>


<script>

  // ==================================================
  // CONFIG
  // ==================================================

  const BACKEND_URL = "http://localhost:3001";

  const VEHICLE_ASSIGNMENT_ID = 176;

  const ROOM = `assignment:${VEHICLE_ASSIGNMENT_ID}`;


  // ==================================================
  // ELEMENT
  // ==================================================

  const statusElement =
    document.getElementById("connectionStatus");

  const socketIdElement =
    document.getElementById("socketId");

  const vehicleDataElement =
    document.getElementById("vehicleData");

  const logsElement =
    document.getElementById("logs");


  // ==================================================
  // LOG FUNCTION
  // ==================================================

  function addLog(message, type = "info-log") {

    const time =
      new Date().toLocaleTimeString();

    const logElement =
      document.createElement("div");

    logElement.className = `log ${type}`;

    logElement.innerText =
      `[${time}] ${message}`;

    logsElement.appendChild(logElement);

    // Auto scroll
    logsElement.scrollTop =
      logsElement.scrollHeight;

    console.log(message);
  }


  // ==================================================
  // CONNECT SOCKET.IO
  // ==================================================

  addLog(
    `Connecting to ${BACKEND_URL}...`
  );


  const socket = io(BACKEND_URL);


  // ==================================================
  // CONNECTED
  // ==================================================

  socket.on("connect", () => {

    addLog(
      `✅ Socket connected: ${socket.id}`,
      "success"
    );

    socketIdElement.innerText =
      socket.id;


    statusElement.className =
      "status connected";

    statusElement.innerText =
      "🟢 Socket Connected";


    // ==================================================
    // JOIN VEHICLE
    // ==================================================

    addLog(
      `📡 Sending vehicle:join for assignment ${VEHICLE_ASSIGNMENT_ID}`,
      "info-log"
    );


    socket.emit("vehicle:join", {

      vehicleAssignmentId:
        VEHICLE_ASSIGNMENT_ID

    });


    addLog(
      `📡 Join sent → ${ROOM}`,
      "info-log"
    );

  });


  // ==================================================
  // VEHICLE JOINED
  // ==================================================

  socket.on("vehicle:joined", (data) => {

    addLog(
      `✅ Successfully joined vehicle ${VEHICLE_ASSIGNMENT_ID}`,
      "success"
    );

    addLog(
      `Join response: ${JSON.stringify(data)}`,
      "success"
    );

    statusElement.className =
      "status connected";

    statusElement.innerText =
      "🟢 Connected + Joined assignment:176";

  });


  // ==================================================
  // VEHICLE UPDATED
  // ==================================================

  socket.on("vehicle:updated", (data) => {

    addLog(
      "🚐 VEHICLE UPDATED RECEIVED!",
      "success"
    );

    addLog(
      `Payload: ${JSON.stringify(data)}`,
      "success"
    );


    // ==================================================
    // UPDATE RAW JSON
    // ==================================================

    vehicleDataElement.innerText =
      JSON.stringify(data, null, 2);


    // ==================================================
    // UPDATE LATITUDE
    // ==================================================

    document.getElementById("latitude")
      .innerText =
      data.latitude ?? "-";


    // ==================================================
    // UPDATE LONGITUDE
    // ==================================================

    document.getElementById("longitude")
      .innerText =
      data.longitude ?? "-";


    // ==================================================
    // UPDATE CURRENT STOP
    // ==================================================

    document.getElementById("currentStopId")
      .innerText =
      data.currentStopId ?? "-";


    // ==================================================
    // UPDATE STATUS
    // ==================================================

    document.getElementById("stopStatus")
      .innerText =
      data.stopStatus ?? "-";


    // ==================================================
    // UPDATE ASSIGNMENT ID
    // ==================================================

    document.getElementById("vehicleAssignmentId")
      .innerText =
      data.vehicleAssignmentId ?? "-";


    // ==================================================
    // UPDATE CREATED AT
    // ==================================================

    document.getElementById("createdAt")
      .innerText =
      data.createdAt ?? "-";

  });


  // ==================================================
  // CONNECTION ERROR
  // ==================================================

  socket.on("connect_error", (error) => {

    addLog(
      `❌ Connection error: ${error.message}`,
      "error"
    );

    statusElement.className =
      "status disconnected";

    statusElement.innerText =
      "🔴 Connection Error";

  });


  // ==================================================
  // DISCONNECT
  // ==================================================

  socket.on("disconnect", (reason) => {

    addLog(
      `🔴 Socket disconnected: ${reason}`,
      "error"
    );

    statusElement.className =
      "status disconnected";

    statusElement.innerText =
      "🔴 Disconnected";

    socketIdElement.innerText =
      "-";

  });


</script>

</body>
</html>
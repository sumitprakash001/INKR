// public/client.js

const nameInput = document.querySelector('input[placeholder="Name"]');
const usernameInput = document.querySelector('input[placeholder="Username"]');
const createBtn = document.getElementById("createBtn");
const joinBtn = document.getElementById("joinBtn");
const roomInput = document.getElementById("roomInput");
const roomLink = document.getElementById("roomLink");

// generate a random room id
function generateRoomId() {
  return "ROOM-" + Math.random().toString(36).substring(2, 7).toUpperCase();
}

createBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const username = usernameInput.value.trim();

  if (!name || !username) {
    alert("Please enter your name and username first.");
    return;
  }

  const roomCode = generateRoomId();
  const roomUrl = `${window.location.origin}/mainPage.html?room=${roomCode}&name=${encodeURIComponent(
    name
  )}&user=${encodeURIComponent(username)}`;

  // show generated code and button
  roomLink.innerHTML = `
    <b>Private Room Created!</b><br>
    Room Code: <b style="color:#22c55e;">${roomCode}</b><br><br>
    Share this link:<br>
    <a href="${roomUrl}" style="color:#38bdf8;">${roomUrl}</a><br><br>
    <button id="startDrawingBtn" style="
      background:#16a34a;
      color:white;
      font-weight:600;
      border:none;
      border-radius:8px;
      padding:8px 16px;
      cursor:pointer;
      margin-top:10px;">Start Drawing</button>
  `;

  document.getElementById("startDrawingBtn").addEventListener("click", () => {
    window.location.href = roomUrl;
  });
});

// ✅ Join Room
joinBtn.addEventListener("click", () => {
  const name = nameInput.value.trim();
  const username = usernameInput.value.trim();
  const code = roomInput.value.trim();

  if (!name || !username || !code) {
    alert("Please enter your name, username, and room code.");
    return;
  }

  const joinUrl = `${window.location.origin}/mainPage.html?room=${code}&name=${encodeURIComponent(
    name
  )}&user=${encodeURIComponent(username)}`;
  window.location.href = joinUrl;
});

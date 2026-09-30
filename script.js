let teams = {
  1: {
    name: "",
    captain: "",
    score: 0,
    card: null,
    players: []
  },
  2: {
    name: "",
    captain: "",
    score: 0,
    card: null,
    players: []
  }
};

let game = {
  seconds: 0,
  running: false,
  interval: null,
  phase: "",
  players: 5,
  dice: null
};

let penalties = [];

let cards = [
  {
    name: "هدف ×2",
    description: "أهداف الفريق تحسب مضاعفة"
  },
  {
    name: "إيقاف لاعب",
    description: "إيقاف لاعب من الفريق المنافس"
  },
  {
    name: "اللاعب النجم",
    description: "هدف اللاعب المختار يحسب مضاعفًا"
  },
  {
    name: "ركلات ترجيح",
    description: "تفعيل ركلات الترجيح"
  },
  {
    name: "الجوكر",
    description: "تفعيل تأثير بطاقة أخرى"
  },
  {
    name: "الركلة العكسية",
    description: "ركلة جزاء عكسية"
  },
  {
    name: "ركلة جزاء",
    description: "الحصول على ركلة جزاء"
  }
];

let cardDrawn = {
  1: false,
  2: false
};

let shootout = {
  turn: 1,
  shots1: 0,
  shots2: 0,
  score1: 0,
  score2: 0
};

let matchball = {
  players: 5,
  active: false
};


/* =========================
   التنقل
========================= */

function showScreen(id) {

  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  const target = document.getElementById(id);

  if (target) {
    target.classList.add("active");
  }
}


/* =========================
   إنشاء أسماء اللاعبين
========================= */

function createPlayerInputs(team) {

  const count =
    Number(document.getElementById(`playerCount${team}`).value);

  const box =
    document.getElementById(`playersInputs${team}`);

  box.innerHTML = "";

  for (let i = 1; i <= count; i++) {

    const wrapper =
      document.createElement("div");

    wrapper.className = "player-input-row";

    wrapper.innerHTML = `
      <span>${i}</span>
      <input
        id="player${team}_${i}"
        type="text"
        placeholder="اسم اللاعب ${i}"
      >
    `;

    box.appendChild(wrapper);
  }
}


/* =========================
   إعداد المباراة
========================= */

function startCards() {

  teams[1].name =
    document.getElementById("team1").value.trim()
    || "الفريق الأول";

  teams[1].captain =
    document.getElementById("captain1").value.trim()
    || "الرئيس الأول";

  teams[2].name =
    document.getElementById("team2").value.trim()
    || "الفريق الثاني";

  teams[2].captain =
    document.getElementById("captain2").value.trim()
    || "الرئيس الثاني";


  const count1 =
    Number(document.getElementById("playerCount1").value);

  const count2 =
    Number(document.getElementById("playerCount2").value);


  teams[1].players = [];

  teams[2].players = [];


  for (let i = 1; i <= count1; i++) {

    const input =
      document.getElementById(`player1_${i}`);

    const name =
      input && input.value.trim()
        ? input.value.trim()
        : `لاعب ${i}`;

    teams[1].players.push({
      name,
      goalkeeper: false,
      active: true,
      penalty: null
    });
  }


  for (let i = 1; i <= count2; i++) {

    const input =
      document.getElementById(`player2_${i}`);

    const name =
      input && input.value.trim()
        ? input.value.trim()
        : `لاعب ${i}`;

    teams[2].players.push({
      name,
      goalkeeper: false,
      active: true,
      penalty: null
    });
  }


  document.getElementById("cardTeam1").textContent =
    teams[1].name;

  document.getElementById("cardTeam2").textContent =
    teams[2].name;

  document.getElementById("result1").textContent = "";
  document.getElementById("result2").textContent = "";

  document.getElementById("draw1").disabled = false;
  document.getElementById("draw2").disabled = false;

  cardDrawn[1] = false;
  cardDrawn[2] = false;

  teams[1].card = null;
  teams[2].card = null;

  document.getElementById("continueToMatch").disabled = true;

  showScreen("cards");
}


/* =========================
   البطاقة السرية
========================= */

function drawSecretCard(team) {

  if (cardDrawn[team]) {
    return;
  }

  const randomIndex =
    Math.floor(Math.random() * cards.length);

  const card =
    cards[randomIndex];

  teams[team].card = card;

  cardDrawn[team] = true;

  document.getElementById(`draw${team}`).disabled = true;

  showSecretCard(card);

  if (cardDrawn[1] && cardDrawn[2]) {
    document.getElementById("continueToMatch").disabled = false;
  }
}


function showSecretCard(card) {

  document.getElementById("secretCardName").textContent =
    card.name;

  document.getElementById("secretCardDescription").textContent =
    card.description;

  document.getElementById("secretOverlay").classList.add("show");
}


/* =========================
   بدء المباراة
========================= */

function startMatch() {

  document.getElementById("matchTeam1").textContent =
    teams[1].name;

  document.getElementById("matchTeam2").textContent =
    teams[2].name;

  document.getElementById("mbTeam1").textContent =
    teams[1].name;

  document.getElementById("mbTeam2").textContent =
    teams[2].name;

  document.getElementById("soTeam1").textContent =
    teams[1].name;

  document.getElementById("soTeam2").textContent =
    teams[2].name;

  document.getElementById("liveTeamName1").textContent =
    teams[1].name;

  document.getElementById("liveTeamName2").textContent =
    teams[2].name;


  teams[1].score = 0;
  teams[2].score = 0;

  teams[1].players.forEach(player => {
    player.active = true;
    player.penalty = null;
  });

  teams[2].players.forEach(player => {
    player.active = true;
    player.penalty = null;
  });


  game.seconds = 0;
  game.dice = null;
  game.players = 5;

  penalties = [];

  updateScoreboard();
  updateTimer();
  updatePhase();
  updateLivePlayers();
  updatePenalties();

  document.getElementById("events").innerHTML = "";

  addEvent("📣 المباراة جاهزة للانطلاق");

  showScreen("match");
}


/* =========================
   المؤقت
========================= */

function toggleTimer() {

  if (game.running) {
    pauseTimer();
  } else {
    startTimer();
  }
}


function startTimer() {

  if (game.running) {
    return;
  }

  game.running = true;

  document.getElementById("status").textContent =
    "جارية";

  document.getElementById("timerButton").textContent =
    "⏸ إيقاف المباراة";

  game.interval = setInterval(() => {

    game.seconds++;

    updateTimer();
    updatePhase();
    updatePenalties();
    checkAutomaticPhases();

  }, 1000);
}


function pauseTimer() {

  game.running = false;

  clearInterval(game.interval);

  document.getElementById("status").textContent =
    "متوقفة";

  document.getElementById("timerButton").textContent =
    "▶ تشغيل المباراة";
}


function updateTimer() {

  const minutes =
    Math.floor(game.seconds / 60);

  const seconds =
    game.seconds % 60;

  document.getElementById("timer").textContent =
    String(minutes).padStart(2, "0")
    + ":"
    + String(seconds).padStart(2, "0");
}


/* =========================
   مراحل المباراة
========================= */

function updatePhase() {

  const minute =
    Math.floor(game.seconds / 60);

  let phase = "";
  let players = 5;

  if (minute < 5) {

    phase = "تصعيد اللاعبين";

    const maxPlayers =
      Math.max(
        teams[1].players.length,
        teams[2].players.length
      );

    players =
      Math.min(
        1 + minute,
        maxPlayers
      );

  } else if (minute < 17) {

    phase = "البطاقات السرية";

    players = 6;

  } else if (minute < 20) {

    phase = "الأهداف مضاعفة ×2";

    players = 6;

  } else if (minute < 23) {

    phase = "مرحلة النرد";

    players =
      game.dice || 1;

  } else if (minute < 36) {

    phase = "اللعب الكامل";

    players = 6;

  } else {

    phase = "النهاية";

    players = 6;
  }

  game.phase = phase;
  game.players = players;

  document.getElementById("phase").textContent =
    phase;

  updateLivePlayers();

  document.getElementById("players").textContent =
    `${countActivePlayers(1)} لاعبين + حارس ضد ${countActivePlayers(2)} لاعبين + حارس`;
}


/* =========================
   عدد اللاعبين
========================= */

function countActivePlayers(team) {

  return teams[team].players.filter(
    player => player.active
  ).length;
}


function updateLivePlayers() {

  for (let team = 1; team <= 2; team++) {

    const box =
      document.getElementById(`livePlayers${team}`);

    if (!box) {
      continue;
    }

    box.innerHTML = "";

    teams[team].players.forEach(player => {

      const item =
        document.createElement("div");

      item.className =
        "live-player";

      if (!player.active) {
        item.classList.add("player-out");
      }

      let icon = "🟢";

      if (player.penalty === "yellow") {
        icon = "🟨";
      }

      if (player.penalty === "red") {
        icon = "🟥";
      }

      item.innerHTML = `
        <span>${icon}</span>
        <strong>${player.name}</strong>
        ${player.goalkeeper ? "<small>حارس</small>" : ""}
      `;

      box.appendChild(item);
    });
  }
}


/* =========================
   انتقال المراحل
========================= */

function checkAutomaticPhases() {

  if (
    game.seconds === 20 * 60
  ) {

    pauseTimer();

    addEvent("🎲 بدأت مرحلة النرد");

    updatePhase();
  }


  if (
    game.seconds === 36 * 60
  ) {

    pauseTimer();

    if (
      teams[1].score ===
      teams[2].score
    ) {

      addEvent(
        "🎯 انتهت المباراة بالتعادل — ركلات الترجيح"
      );

      startShootouts();

    } else {

      addEvent(
        "⚽ بدأت كرة المباراة"
      );

      startMatchball();
    }
  }
}


/* =========================
   تسجيل الهدف
========================= */

function goalMenu(team) {

  if (game.phase === "النهاية") {
    return;
  }

  const activePlayers =
    teams[team].players.filter(
      player => player.active
    );

  if (activePlayers.length === 0) {
    alert("لا يوجد لاعب متاح من هذا الفريق.");
    return;
  }

  document.getElementById("playerOverlayTitle").textContent =
    `من سجل الهدف؟ — ${teams[team].name}`;

  const choices =
    document.getElementById("playerChoices");

  choices.innerHTML = "";

  activePlayers.forEach(player => {

    const button =
      document.createElement("button");

    button.type = "button";

    button.textContent =
      player.name;

    button.onclick = () => {
      registerGoal(team, player.name);
    };

    choices.appendChild(button);
  });

  document.getElementById("playerOverlay").classList.add("show");
}


function registerGoal(team, playerName) {

  closeOverlay("playerOverlay");

  let value = 1;

  if (game.phase === "الأهداف مضاعفة ×2") {
    value = 2;
  }

  teams[team].score += value;

  addEvent(
    value === 2
      ? `⚽⚽ ${playerName} سجل — هدفان`
      : `⚽ ${playerName} سجل لـ ${teams[team].name}`
  );

  updateScoreboard();

  showGoalOverlay(
    team,
    playerName,
    value
  );
}


function showGoalOverlay(team, playerName, value) {

  document.getElementById("goalScorer").textContent =
    playerName;

  document.getElementById("goalTeam").textContent =
    value === 2
      ? `${teams[team].name} — هدفان ×2`
      : teams[team].name;

  document.getElementById("goalOverlay").classList.add("show");

  playGoalSound();
}


/* =========================
   النتيجة
========================= */

function changeScore(team, amount) {

  if (
    amount > 0 &&
    game.phase === "الأهداف مضاعفة ×2"
  ) {

    teams[team].score += 2;

    addEvent(
      `⚽⚽ هدفان محسوبان لـ ${teams[team].name}`
    );

  } else {

    teams[team].score += amount;

    if (amount > 0) {

      addEvent(
        `⚽ هدف لـ ${teams[team].name}`
      );

    } else {

      addEvent(
        `تم حذف هدف من ${teams[team].name}`
      );
    }
  }

  if (teams[team].score < 0) {
    teams[team].score = 0;
  }

  updateScoreboard();
}


function updateScoreboard() {

  document.getElementById("score1").textContent =
    teams[1].score;

  document.getElementById("score2").textContent =
    teams[2].score;

  document.getElementById("mbScore1").textContent =
    teams[1].score;

  document.getElementById("mbScore2").textContent =
    teams[2].score;

  document.getElementById("soScore1").textContent =
    shootout.score1;

  document.getElementById("soScore2").textContent =
    shootout.score2;
}


/* =========================
   سجل المباراة
========================= */

function addEvent(text) {

  const box =
    document.getElementById("events");

  if (!box) {
    return;
  }

  const event =
    document.createElement("div");

  event.className = "event";

  event.textContent =
    `${formatTime(game.seconds)} — ${text}`;

  box.prepend(event);
}


function formatTime(seconds) {

  const minutes =
    Math.floor(seconds / 60);

  const secs =
    seconds % 60;

  return (
    String(minutes).padStart(2, "0")
    + ":"
    + String(secs).padStart(2, "0")
  );
}


/* =========================
   الصافرة المحسنة
========================= */

let whistleAudio = null;


function playWhistle() {

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    if (!whistleAudio) {
      whistleAudio = new AudioContext();
    }

    const audio = whistleAudio;

    if (audio.state === "suspended") {
      audio.resume();
    }


    const now =
      audio.currentTime;


    const master =
      audio.createGain();

    master.gain.setValueAtTime(
      0.0001,
      now
    );

    master.gain.exponentialRampToValueAtTime(
      0.65,
      now + 0.025
    );

    master.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.65
    );

    master.connect(audio.destination);


    const osc1 =
      audio.createOscillator();

    const osc2 =
      audio.createOscillator();


    osc1.type = "triangle";
    osc2.type = "sine";


    osc1.frequency.setValueAtTime(
      3300,
      now
    );

    osc1.frequency.exponentialRampToValueAtTime(
      2200,
      now + 0.65
    );


    osc2.frequency.setValueAtTime(
      3600,
      now
    );

    osc2.frequency.exponentialRampToValueAtTime(
      2400,
      now + 0.65
    );


    osc1.connect(master);
    osc2.connect(master);

    osc1.start(now);
    osc2.start(now);

    osc1.stop(now + 0.65);
    osc2.stop(now + 0.65);


    addEvent("📣 صافرة الحكم");

  } catch (error) {

    addEvent("📣 صافرة");
  }
}


/* =========================
   صوت الهدف
========================= */

function playGoalSound() {

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    const audio =
      new AudioContext();

    const now =
      audio.currentTime;

    const gain =
      audio.createGain();

    gain.gain.setValueAtTime(
      0.0001,
      now
    );

    gain.gain.exponentialRampToValueAtTime(
      0.25,
      now + 0.03
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      now + 0.8
    );

    gain.connect(audio.destination);

    const osc =
      audio.createOscillator();

    osc.type = "triangle";

    osc.frequency.setValueAtTime(
      500,
      now
    );

    osc.frequency.exponentialRampToValueAtTime(
      900,
      now + 0.2
    );

    osc.frequency.exponentialRampToValueAtTime(
      1200,
      now + 0.5
    );

    osc.connect(gain);

    osc.start(now);
    osc.stop(now + 0.8);

  } catch (error) {}
}


/* =========================
   النرد
========================= */

function rollDice() {

  const minute =
    Math.floor(game.seconds / 60);

  if (
    minute < 20 ||
    minute >= 23
  ) {

    addEvent(
      "🎲 النرد متاح من الدقيقة 20 إلى 23 فقط"
    );

    return;
  }

  const result =
    Math.floor(Math.random() * 3) + 1;

  game.dice = result;

  updatePhase();

  addEvent(
    `🎲 نتيجة النرد: ${result} ضد ${result}`
  );
}


/* =========================
   البطاقات
========================= */

function showCards() {

  const minute =
    Math.floor(game.seconds / 60);

  if (
    !(
      (minute >= 5 && minute < 17) ||
      (minute >= 23 && minute < 36)
    )
  ) {

    addEvent(
      "🃏 البطاقات غير متاحة في هذه المرحلة"
    );

    return;
  }

  addEvent("🃏 البطاقات السرية متاحة للفريقين");
}


/* =========================
   ركلة الرئيس
========================= */

function presidentPenalty() {

  const minute =
    Math.floor(game.seconds / 60);

  if (
    minute < 5 ||
    minute >= 36 ||
    (minute >= 17 && minute < 23)
  ) {

    addEvent(
      "👑 ركلة الرئيس غير متاحة الآن"
    );

    return;
  }

  const team =
    prompt(
      `من ينفذ ركلة الرئيس؟\n\n1 - ${teams[1].name}\n2 - ${teams[2].name}`
    );

  if (
    team !== "1" &&
    team !== "2"
  ) {
    return;
  }

  openPenalty(Number(team));
}


function openPenalty(team) {

  const result =
    confirm(
      `${teams[team].name}\n\nهل سجل الرئيس الركلة؟`
    );

  if (result) {

    teams[team].score++;

    updateScoreboard();

    addEvent(
      `👑⚽ هدف من ركلة الرئيس لـ ${teams[team].name}`
    );

  } else {

    addEvent(
      "👑🧤 تصدي لركلة الرئيس"
    );
  }
}


/* =========================
   البطاقات على اللاعبين
========================= */

function choosePlayerForCard(type) {

  const allPlayers = [];

  for (let team = 1; team <= 2; team++) {

    teams[team].players.forEach(player => {

      if (player.active) {

        allPlayers.push({
          team,
          player
        });

      }

    });
  }

  return allPlayers;
}


function yellowCard() {

  const available =
    choosePlayerForCard("yellow");

  if (available.length === 0) {
    return;
  }

  const names =
    available.map((item, index) =>
      `${index + 1} - ${item.player.name} (${teams[item.team].name})`
    ).join("\n");

  const choice =
    Number(
      prompt(
        `اختر اللاعب:\n\n${names}`
      )
    );

  const selected =
    available[choice - 1];

  if (!selected) {
    return;
  }

  applyPenalty(
    selected.team,
    selected.player,
    "yellow"
  );
}


function redCard() {

  const available =
    choosePlayerForCard("red");

  if (available.length === 0) {
    return;
  }

  const names =
    available.map((item, index) =>
      `${index + 1} - ${item.player.name} (${teams[item.team].name})`
    ).join("\n");

  const choice =
    Number(
      prompt(
        `اختر اللاعب:\n\n${names}`
      )
    );

  const selected =
    available[choice - 1];

  if (!selected) {
    return;
  }

  applyPenalty(
    selected.team,
    selected.player,
    "red"
  );
}


function applyPenalty(team, player, type) {

  const duration =
    type === "yellow"
      ? 120
      : 300;

  player.active = false;
  player.penalty = type;

  const penalty = {
    id: Date.now(),
    team,
    player: player.name,
    type,
    remaining: duration
  };

  penalties.push(penalty);

  addEvent(
    `${type === "yellow" ? "🟨" : "🟥"} ${player.name} خرج من الملعب`
  );

  updatePenalties();
  updateLivePlayers();
}


/* =========================
   العقوبات
========================= */

function updatePenalties() {

  const box =
    document.getElementById("penalties");

  if (!box) {
    return;
  }

  if (penalties.length === 0) {

    box.innerHTML =
      `<p class="empty-penalties">
        لا توجد عقوبات حاليًا
      </p>`;

    return;
  }

  box.innerHTML = "";

  penalties.forEach(penalty => {

    const item =
      document.createElement("div");

    item.className =
      penalty.type === "yellow"
        ? "penalty-item penalty-yellow"
        : "penalty-item penalty-red";

    item.innerHTML = `
      <div>
        ${penalty.type === "yellow" ? "🟨" : "🟥"}
        ${penalty.player}
      </div>

      <div class="penalty-time">
        ${formatTime(penalty.remaining)}
      </div>
    `;

    box.appendChild(item);
  });
}


/* =========================
   كرة المباراة
========================= */

function startMatchball() {

  matchball.active = true;

  matchball.players =
    Math.max(
      teams[1].players.length,
      teams[2].players.length
    );

  document.getElementById("matchballPlayers").textContent =
    `${matchball.players} ضد ${matchball.players}`;

  document.getElementById("matchballMessage").textContent =
    "الهدف القادم يحسم المباراة.";

  showScreen("matchball");
}


function matchballGoal(team) {

  teams[team].score++;

  updateScoreboard();

  addEvent(
    `⚽ ${teams[team].name} سجل في كرة المباراة`
  );

  finishGame(team);
}


/* =========================
   ركلات الترجيح
========================= */

function startShootouts() {

  shootout = {
    turn: 1,
    shots1: 0,
    shots2: 0,
    score1: 0,
    score2: 0
  };

  updateScoreboard();

  document.getElementById("shootoutTurn").textContent =
    `${teams[1].name} يسدد`;

  showScreen("shootouts");
}


function shootoutResult(scored) {

  const team =
    shootout.turn;

  if (team === 1) {

    shootout.shots1++;

    if (scored) {
      shootout.score1++;
    }

    addEvent(
      scored
        ? `🎯 ${teams[1].name} سجل ركلة`
        : `❌ ${teams[1].name} أهدر الركلة`
    );

    shootout.turn = 2;

  } else {

    shootout.shots2++;

    if (scored) {
      shootout.score2++;
    }

    addEvent(
      scored
        ? `🎯 ${teams[2].name} سجل ركلة`
        : `❌ ${teams[2].name} أهدر الركلة`
    );

    shootout.turn = 1;
  }

  updateScoreboard();

  if (
    shootout.shots1 >= 5 &&
    shootout.shots2 >= 5 &&
    shootout.score1 !== shootout.score2
  ) {

    const winner =
      shootout.score1 >
      shootout.score2
        ? 1
        : 2;

    finishGame(winner);

    return;
  }

  document.getElementById("shootoutTurn").textContent =
    `${teams[shootout.turn].name} يسدد`;
}


/* =========================
   النهاية
========================= */

function finishGame(team) {

  pauseTimer();

  document.getElementById("winner").textContent =
    `${teams[team].name} 🏆`;

  document.getElementById("finalScore").textContent =
    `${teams[1].score} - ${teams[2].score}`;

  showScreen("final");
}


/* =========================
   مؤقت العقوبات
========================= */

setInterval(() => {

  if (!game.running) {
    return;
  }

  penalties.forEach(penalty => {

    if (penalty.remaining > 0) {
      penalty.remaining--;
    }

  });


  const finished =
    penalties.filter(
      penalty =>
        penalty.remaining <= 0
    );


  finished.forEach(penalty => {

    const player =
      teams[penalty.team].players.find(
        p => p.name === penalty.player
      );

    if (player) {

      player.active = true;
      player.penalty = null;

    }

    addEvent(
      `✅ عاد ${penalty.player} إلى الملعب`
    );

  });


  penalties =
    penalties.filter(
      penalty =>
        penalty.remaining > 0
    );


  updatePenalties();
  updateLivePlayers();

}, 1000);


/* =========================
   إغلاق النوافذ
========================= */

function closeOverlay(id) {

  const overlay =
    document.getElementById(id);

  if (overlay) {
    overlay.classList.remove("show");
  }
}


/* =========================
   البداية
========================= */

window.addEventListener("DOMContentLoaded", () => {

  createPlayerInputs(1);
  createPlayerInputs(2);

});

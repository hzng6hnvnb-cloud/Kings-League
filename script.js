let teams = {
  1: {
    name: "",
    captain: "",
    score: 0,
    card: null
  },
  2: {
    name: "",
    captain: "",
    score: 0,
    card: null
  }
};

let game = {
  seconds: 0,
  running: false,
  interval: null,
  phase: "",
  players: 1,
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
    description: "تفعيل ركلات ترجيح"
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


/* =========================
   التنقل بين الصفحات
========================= */

function showScreen(id) {

  document
    .querySelectorAll(".screen")
    .forEach(screen => {
      screen.classList.remove("active");
    });

  const target =
    document.getElementById(id);

  if (target) {
    target.classList.add("active");
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
   سحب البطاقة العشوائية
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

  const result =
    document.getElementById(`result${team}`);

  result.innerHTML = `
    <strong>${card.name}</strong>
    <small>${card.description}</small>
  `;

  document.getElementById(`draw${team}`).disabled =
    true;

  if (cardDrawn[1] && cardDrawn[2]) {
    document.getElementById("continueToMatch").disabled =
      false;
  }
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

  teams[1].score = 0;
  teams[2].score = 0;

  game.seconds = 0;
  game.dice = null;
  game.players = 1;

  penalties = [];

  updateScoreboard();
  updatePenalties();
  updateTimer();
  updatePhase();

  document.getElementById("events").innerHTML = "";

  addEvent(
    "📣 المباراة جاهزة للانطلاق"
  );

  showScreen("match");
}


/* =========================
   الوقت
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

  game.interval =
    setInterval(() => {

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
  let players = 1;

  if (minute < 5) {

    phase = "تصعيد اللاعبين";

    players =
      Math.min(1 + minute, 6);

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

  document.getElementById("players").textContent =
    `${players} + حارس ضد ${players} + حارس`;
}


/* =========================
   انتقالات المراحل
========================= */

function checkAutomaticPhases() {

  const minute =
    Math.floor(game.seconds / 60);

  if (
    minute === 20 &&
    game.seconds % 60 === 0
  ) {

    pauseTimer();

    addEvent(
      "🎲 بدأت مرحلة النرد"
    );

    rollDice();
  }


  if (
    minute === 36 &&
    game.seconds % 60 === 0
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
   الأحداث
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

  event.textContent = text;

  box.prepend(event);
}


/* =========================
   الصافرة
========================= */

function playWhistle() {

  try {

    const AudioContext =
      window.AudioContext ||
      window.webkitAudioContext;

    const audio =
      new AudioContext();

    const oscillator =
      audio.createOscillator();

    const gain =
      audio.createGain();

    oscillator.type = "sine";

    oscillator.frequency.setValueAtTime(
      2600,
      audio.currentTime
    );

    oscillator.frequency.exponentialRampToValueAtTime(
      1400,
      audio.currentTime + 0.35
    );

    gain.gain.setValueAtTime(
      0.0001,
      audio.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
      0.5,
      audio.currentTime + 0.02
    );

    gain.gain.exponentialRampToValueAtTime(
      0.0001,
      audio.currentTime + 0.4
    );

    oscillator.connect(gain);
    gain.connect(audio.destination);

    oscillator.start();

    oscillator.stop(
      audio.currentTime + 0.4
    );

  } catch (error) {

    addEvent(
      "📣 تم الضغط على الصافرة"
    );
  }

  addEvent("📣 صافرة");
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
    `🎲 نتيجة النرد: ${result}`
  );
}


/* =========================
   البطاقات أثناء المباراة
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

  if (teams[1].card) {

    addEvent(
      `🃏 بطاقة ${teams[1].name}: ${teams[1].card.name}`
    );
  }

  if (teams[2].card) {

    addEvent(
      `🃏 بطاقة ${teams[2].name}: ${teams[2].card.name}`
    );
  }
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

    changeScore(team, 1);

    addEvent(
      `👑⚽ هدف من ركلة الرئيس`
    );

  } else {

    addEvent(
      "🧤 تصدي لركلة الرئيس"
    );
  }
}


/* =========================
   البطاقة الصفراء
========================= */

function yellowCard() {

  const player =
    prompt(
      "اكتب اسم اللاعب الذي حصل على البطاقة الصفراء:"
    );

  if (!player || !player.trim()) {
    return;
  }

  const name =
    player.trim();

  const penalty = {
    id: Date.now(),
    player: name,
    type: "yellow",
    remaining: 120
  };

  penalties.push(penalty);

  addEvent(
    `🟨 بطاقة صفراء — ${name}`
  );

  updatePenalties();
}


/* =========================
   البطاقة الحمراء
========================= */

function redCard() {

  const player =
    prompt(
      "اكتب اسم اللاعب الذي حصل على البطاقة الحمراء:"
    );

  if (!player || !player.trim()) {
    return;
  }

  const name =
    player.trim();

  const penalty = {
    id: Date.now(),
    player: name,
    type: "red",
    remaining: 300
  };

  penalties.push(penalty);

  addEvent(
    `🟥 بطاقة حمراء — ${name}`
  );

  updatePenalties();
}


/* =========================
   تحديث العقوبات
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

    const minutes =
      Math.floor(
        penalty.remaining / 60
      );

    const seconds =
      penalty.remaining % 60;

    item.innerHTML = `
      <div>
        ${penalty.type === "yellow" ? "🟨" : "🟥"}
        ${penalty.player}
      </div>

      <div class="penalty-time">
        ${minutes}:${String(seconds).padStart(2, "0")}
      </div>
    `;

    box.appendChild(item);
  });
}


/* =========================
   كرة المباراة
========================= */

let matchball = {
  players: 5,
  active: false
};

function startMatchball() {

  matchball.active = true;
  matchball.players = 5;

  document.getElementById("matchballPlayers").textContent =
    "5 ضد 5";

  document.getElementById("matchballMessage").textContent =
    "الفريق المتقدم يحتاج هدفًا لإنهاء المباراة.";

  showScreen("matchball");
}


function matchballGoal(team) {

  const other =
    team === 1 ? 2 : 1;

  if (
    teams[1].score ===
    teams[2].score
  ) {

    teams[team].score++;

    updateScoreboard();

    finishGame(team);

    return;
  }

  const leader =
    teams[1].score >
    teams[2].score
      ? 1
      : 2;

  if (team === leader) {

    finishGame(team);

    return;
  }

  teams[team].score++;

  updateScoreboard();

  if (
    teams[1].score ===
    teams[2].score
  ) {

    document.getElementById(
      "matchballMessage"
    ).textContent =
      "تعادل! الهدف القادم يحسم المباراة.";

    addEvent(
      `⚽ ${teams[team].name} عادل النتيجة`
    );

  } else {

    finishGame(team);
  }
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

  document.getElementById(
    "shootoutTurn"
  ).textContent =
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

    shootout.turn = 2;

  } else {

    shootout.shots2++;

    if (scored) {
      shootout.score2++;
    }

    shootout.turn = 1;
  }

  updateScoreboard();

  if (
    shootout.shots1 >= 5 &&
    shootout.shots2 >= 5
  ) {

    if (
      shootout.score1 !==
      shootout.score2
    ) {

      const winner =
        shootout.score1 >
        shootout.score2
          ? 1
          : 2;

      finishGame(winner);

      return;
    }
  }

  document.getElementById(
    "shootoutTurn"
  ).textContent =
    `${teams[shootout.turn].name} يسدد`;
}


/* =========================
   نهاية المباراة
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

    addEvent(
      `✅ انتهت عقوبة ${penalty.player}`
    );

  });

  penalties =
    penalties.filter(
      penalty =>
        penalty.remaining > 0
    );

  updatePenalties();

}, 1000);

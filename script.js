let teams = {
  1: { name: "", captain: "", score: 0, card: null },
  2: { name: "", captain: "", score: 0, card: null }
};

let game = {
  seconds: 0,
  running: false,
  interval: null,
  phase: "pre",
  dice: null,
  players: 1,
  matchballPlayers: 5,
  matchballNextGoalWins: false
};

const officialCards = [
  {
    name: "هدف ×2",
    desc: "أهداف الفريق تتضاعف لمدة 4 دقائق"
  },
  {
    name: "إيقاف لاعب",
    desc: "إيقاف لاعب من الفريق المنافس"
  },
  {
    name: "اللاعب النجم",
    desc: "هدف اللاعب المختار يحسب مضاعفًا"
  },
  {
    name: "ركلات ترجيح",
    desc: "تفعيل ركلات ترجيح"
  },
  {
    name: "الجوكر",
    desc: "تفعيل تأثير بطاقة أخرى"
  },
  {
    name: "الركلة العكسية",
    desc: "ركلة جزاء عكسية"
  },
  {
    name: "ركلة جزاء",
    desc: "الحصول على ركلة جزاء"
  }
];

let selectedCards = {
  1: false,
  2: false
};

let cardSets = {
  1: [],
  2: []
};

function showScreen(id) {
  document.querySelectorAll(".screen").forEach(screen => {
    screen.classList.remove("active");
  });

  document.getElementById(id).classList.add("active");
}

function startCards() {

  teams[1].name =
    document.getElementById("team1").value.trim() || "الفريق الأول";

  teams[1].captain =
    document.getElementById("captain1").value.trim() || "الرئيس الأول";

  teams[2].name =
    document.getElementById("team2").value.trim() || "الفريق الثاني";

  teams[2].captain =
    document.getElementById("captain2").value.trim() || "الرئيس الثاني";

  document.getElementById("cardTeam1").textContent = teams[1].name;
  document.getElementById("cardTeam2").textContent = teams[2].name;

  cardSets[1] = randomCards();
  cardSets[2] = randomCards();

  renderCards(1);
  renderCards(2);

  document.getElementById("cardInstruction").textContent =
    "كل فريق يختار بطاقة سرية واحدة.";

  showScreen("cards");
}

function randomCards() {

  const shuffled = [...officialCards]
    .sort(() => Math.random() - 0.5);

  return shuffled.slice(0, 5);
}

function renderCards(team) {

  const container =
    document.getElementById(`cards${team}`);

  container.innerHTML = "";

  cardSets[team].forEach((card, index) => {

    const div = document.createElement("div");

    div.className = "card";

    div.innerHTML = `
      <strong>${card.name}</strong>
      <small>${card.desc}</small>
    `;

    div.onclick = () => selectCard(team, index);

    container.appendChild(div);
  });
}

function selectCard(team, index) {

  const container =
    document.getElementById(`cards${team}`);

  [...container.children].forEach(card => {
    card.classList.remove("selected");
  });

  container.children[index].classList.add("selected");

  teams[team].card = cardSets[team][index];

  selectedCards[team] = true;

  if (selectedCards[1] && selectedCards[2]) {
    document.getElementById("continueToMatch").disabled = false;
  }
}

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

  addEvent(
    `تم اختيار البطاقات السرية للفريقين`
  );

  setPhase();

  showScreen("match");
}

function toggleTimer() {

  if (game.running) {
    pauseTimer();
  } else {
    startTimer();
  }
}

function startTimer() {

  game.running = true;

  document.getElementById("status").textContent =
    "جارية";

  document.getElementById("timerButton").textContent =
    "⏸ إيقاف المباراة";

  game.interval = setInterval(() => {

    game.seconds++;

    updateMatch();

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

function updateMatch() {

  updateTimer();
  setPhase();
  updatePlayers();

  if (game.seconds >= 2160) {
    finishSecondHalf();
  }
}

function updateTimer() {

  const minutes =
    Math.floor(game.seconds / 60);

  const seconds =
    game.seconds % 60;

  document.getElementById("timer").textContent =
    String(minutes).padStart(2, "0") +
    ":" +
    String(seconds).padStart(2, "0");
}

function setPhase() {

  const minute =
    Math.floor(game.seconds / 60);

  let phase = "";
  let players = 1;

  if (minute < 5) {

    phase = "تصعيد اللاعبين";

    players = Math.min(
      1 + minute,
      6
    );

  } else if (minute < 17) {

    phase = "البطاقات السرية";

    players = 6;

  } else if (minute < 20) {

    phase = "الأهداف مضاعفة ×2";

    players = 6;

  } else if (minute < 23) {

    phase = "النرد";

    players = game.dice || 1;

  } else if (minute < 36) {

    phase = "اللعب الكامل";

    players = 6;

  } else {

    if (
      teams[1].score ===
      teams[2].score
    ) {
      phase = "ركلات الترجيح";
    } else {
      phase = "كرة المباراة";
    }
  }

  game.phase = phase;
  game.players = players;

  document.getElementById("phase").textContent =
    phase;
}

function updatePlayers() {

  const minute =
    Math.floor(game.seconds / 60);

  let text = "";

  if (minute < 5) {

    text =
      `${game.players} + حارس ضد ${game.players} + حارس`;

  } else if (minute >= 20 && minute < 23) {

    text =
      `${game.players} + حارس ضد ${game.players} + حارس`;

  } else if (minute >= 36) {

    text = "كرة المباراة";

  } else {

    text =
      "7 ضد 7";
  }

  document.getElementById("players").textContent =
    text;
}

function changeScore(team, amount) {

  teams[team].score += amount;

  if (teams[team].score < 0) {
    teams[team].score = 0;
  }

  updateScoreboard();

  addEvent(
    `${teams[team].name}: ${
      amount > 0 ? "تم تسجيل هدف" : "تم حذف هدف"
    }`
  );

  if (
    game.phase === "كرة المباراة" &&
    amount > 0
  ) {
    checkMatchball(team);
  }
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

function addEvent(text) {

  const box =
    document.getElementById("events");

  const event =
    document.createElement("div");

  event.className = "event";

  event.textContent =
    text;

  box.prepend(event);
}

function rollDice() {

  const minute =
    Math.floor(game.seconds / 60);

  if (minute < 20 || minute >= 23) {

    addEvent(
      "النرد متاح فقط من الدقيقة 20 إلى 23"
    );

    return;
  }

  const result =
    Math.floor(Math.random() * 3) + 1;

  game.dice = result;
  game.players = result;

  addEvent(
    `🎲 نتيجة النرد: ${result}`
  );

  setPhase();
  updatePlayers();
}

function showCards() {

  const minute =
    Math.floor(game.seconds / 60);

  if (
    (minute >= 5 && minute < 17) ||
    (minute >= 23 && minute < 36)
  ) {

    const card1 =
      teams[1].card
        ? teams[1].card.name
        : "لا توجد";

    const card2 =
      teams[2].card
        ? teams[2].card.name
        : "لا توجد";

    addEvent(
      `🃏 بطاقة ${teams[1].name}: ${card1}`
    );

    addEvent(
      `🃏 بطاقة ${teams[2].name}: ${card2}`
    );

  } else {

    addEvent(
      "البطاقات غير متاحة في هذه المرحلة"
    );
  }
}

function presidentPenalty() {

  const minute =
    Math.floor(game.seconds / 60);

  if (
    minute < 5 ||
    minute >= 36 ||
    (minute >= 17 && minute < 23)
  ) {

    addEvent(
      "ركلة الرئيس غير متاحة في هذه المرحلة"
    );

    return;
  }

  addEvent(
    "👑 تم تفعيل ركلة الرئيس"
  );

  openPenalty(1);
}

function openPenalty(team) {

  const scored =
    confirm(
      `${teams[team].name}\n\nهل سجلت ركلة الجزاء؟`
    );

  if (scored) {

    changeScore(team, 1);

    addEvent(
      "⚽ تم تسجيل ركلة الجزاء"
    );

  } else {

    addEvent(
      "🧤 تم التصدي لركلة الجزاء"
    );
  }
}

function finishSecondHalf() {

  pauseTimer();

  if (
    teams[1].score ===
    teams[2].score
  ) {

    startShootouts();

  } else {

    startMatchball();
  }
}

function startMatchball() {

  game.matchballPlayers = 5;
  game.matchballNextGoalWins = false;

  document.getElementById("matchballPlayers").textContent =
    "5 ضد 5";

  document.getElementById("matchballMessage").textContent =
    "الفريق المتقدم ينهي المباراة إذا سجل.";

  showScreen("matchball");
}

function matchballGoal(team) {

  const leader =
    teams[1].score > teams[2].score
      ? 1
      : 2;

  const trailing =
    leader === 1 ? 2 : 1;

  if (team === leader) {

    finishGame(team);
    return;

  }

  if (team === trailing) {

    teams[team].score++;

    updateScoreboard();

    if (
      teams[1].score ===
      teams[2].score
    ) {

      game.matchballNextGoalWins = true;

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
}

function finishGame(team) {

  pauseTimer();

  document.getElementById("winner").textContent =
    `${teams[team].name} 🏆`;

  document.getElementById("finalScore").textContent =
    `${teams[1].score} - ${teams[2].score}`;

  showScreen("final");
}

let shootout = {
  turn: 1,
  shots1: 0,
  shots2: 0,
  score1: 0,
  score2: 0
};

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

  if (team === 1) {

    document.getElementById("shootoutTurn").textContent =
      `${teams[2].name} يسدد`;

  } else {

    document.getElementById("shootoutTurn").textContent =
      `${teams[1].name} يسدد`;
  }
}

function checkMatchball(team) {

  const leader =
    teams[1].score > teams[2].score
      ? 1
      : 2;

  if (team === leader) {
    finishGame(team);
  }
}

window.addEventListener(
  "beforeunload",
  () => {
    clearInterval(game.interval);
  }
);

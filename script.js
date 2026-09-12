/* 	File: script.js 
	Author: Shayan Siddiqi
	Date Created: 25/08/2026
	Last Modified: 12/09/2026
*/

import kaboom from "https://unpkg.com/kaplay@3001.0.19/dist/kaplay.mjs";




/* ============================================================
   STATE (coins, subject, skins)
   ============================================================ */

const state = {
	coins: 0,
	subject: "Biology",
	ownedSkins: ["blob"],
	equippedSkin: "blob",
};

const COINS_PER_CORRECT_ANSWER = 5;

/* ============================================================
   QUESTION BANK — 5 questions per subject, 1 correct + 3 incorrect
   ============================================================ */

const QUESTIONS = {
	Biology: [
		{
			question: "What is the primary function of the mitochondria in a cell?",
			correct: "Produce energy (ATP) for the cell",
			incorrect: ["Store genetic information", "Synthesise proteins", "Control cell movement"],
		},
		{
			question: "Which biomolecule is the primary carrier of genetic information?",
			correct: "DNA",
			incorrect: ["Lipids", "Carbohydrates", "ATP"],
		},
		{
			question: "What is the process by which plants convert light energy into chemical energy?",
			correct: "Photosynthesis",
			incorrect: ["Respiration", "Fermentation", "Transpiration"],
		},
		{
			question: "Which blood cells are primarily responsible for fighting infection?",
			correct: "White blood cells",
			incorrect: ["Red blood cells", "Platelets", "Plasma"],
		},
		{
			question: "What is the basic structural and functional unit of all living organisms?",
			correct: "The cell",
			incorrect: ["The atom", "The organ", "The tissue"],
		},
	],
	Physics: [
		{
			question: "What is the SI unit of force?",
			correct: "Newton",
			incorrect: ["Joule", "Watt", "Pascal"],
		},
		{
			question: "According to Newton's First Law, an object at rest stays at rest unless acted on by:",
			correct: "An unbalanced external force",
			incorrect: ["Gravity alone", "Its own mass", "Friction only"],
		},
		{
			question: "Which formula correctly calculates kinetic energy?",
			correct: "½ × mass × velocity²",
			incorrect: ["mass × gravity × height", "force × distance", "mass × velocity"],
		},
		{
			question: "What type of energy is stored in a stretched spring?",
			correct: "Elastic potential energy",
			incorrect: ["Kinetic energy", "Thermal energy", "Chemical energy"],
		},
		{
			question: "What happens to the wavelength of light as its frequency increases?",
			correct: "It decreases",
			incorrect: ["It increases", "It stays the same", "It becomes zero"],
		},
	],
	Chemistry: [
		{
			question: "The atomic number of an element is determined by its number of:",
			correct: "Protons",
			incorrect: ["Neutrons", "Electrons only", "Atomic mass"],
		},
		{
			question: "Which type of bond involves the sharing of electron pairs between atoms?",
			correct: "Covalent bond",
			incorrect: ["Ionic bond", "Metallic bond", "Hydrogen bond"],
		},
		{
			question: "What is the pH of a neutral solution at 25°C?",
			correct: "7",
			incorrect: ["0", "14", "1"],
		},
		{
			question: "What is the name of the process where a solid changes directly to a gas?",
			correct: "Sublimation",
			incorrect: ["Evaporation", "Condensation", "Deposition"],
		},
		{
			question: "Which gas is most abundant in Earth's atmosphere?",
			correct: "Nitrogen",
			incorrect: ["Oxygen", "Carbon dioxide", "Argon"],
		},
	],
	Psychology: [
		{
			question: "Who is considered the founder of classical conditioning?",
			correct: "Ivan Pavlov",
			incorrect: ["B.F. Skinner", "Sigmund Freud", "Jean Piaget"],
		},
		{
			question: "What term describes learning through rewards and punishments?",
			correct: "Operant conditioning",
			incorrect: ["Classical conditioning", "Observational learning", "Cognitive mapping"],
		},
		{
			question: "Which part of the brain is primarily responsible for forming new long-term memories?",
			correct: "Hippocampus",
			incorrect: ["Cerebellum", "Amygdala", "Medulla"],
		},
		{
			question: "What is the term for the tendency to seek information that confirms existing beliefs?",
			correct: "Confirmation bias",
			incorrect: ["Hindsight bias", "Actor-observer bias", "Availability heuristic"],
		},
		{
			question: "According to Maslow's hierarchy of needs, which need must be met first?",
			correct: "Physiological needs",
			incorrect: ["Self-actualisation", "Esteem", "Belonging"],
		},
	],
};

let lastQuestionIndex = -1;

function getRandomQuestion(subject) {
	const bank = QUESTIONS[subject] || QUESTIONS.Biology;
	let index;
	do {
		index = Math.floor(Math.random() * bank.length);
	} while (bank.length > 1 && index === lastQuestionIndex);
	lastQuestionIndex = index;
	return bank[index];
}

function shuffle(array) {
	const copy = [...array];
	for (let i = copy.length - 1; i > 0; i--) {
		const j = Math.floor(Math.random() * (i + 1));
		[copy[i], copy[j]] = [copy[j], copy[i]];
	}
	return copy;
}

/* ============================================================
   SKINS — visual-only, purchased with coins
   ============================================================ */

const SKINS = [
	{ id: "blob", name: "Classic", cost: 0 },
	{ id: "silver", name: "Silver", cost: 50 },
	{ id: "golden", name: "Golden", cost: 100 },
	{ id: "georgie", name: "Georgie", cost: 200 },
];

/* ============================================================
   DOM REFERENCES
   ============================================================ */

const mainMenu = document.getElementById("main-menu");
const subjectMenu = document.getElementById("subject-menu");
const skinsMenu = document.getElementById("skins-menu");
const controlsMenu = document.getElementById("controls-menu");
const gameContainer = document.getElementById("game-container");

const mainMenuCoins = document.getElementById("main-menu-coins");
const skinsMenuCoins = document.getElementById("skins-menu-coins");
const subjectList = document.getElementById("subject-list");
const skinsList = document.getElementById("skins-list");

const questionModal = document.getElementById("question-modal");
const questionText = document.getElementById("question-text");
const answerButtons = document.getElementById("answer-buttons");

const pauseModal = document.getElementById("pause-modal");
const resumeBtn = document.getElementById("resume-btn");
const pauseMenuBtn = document.getElementById("pause-menu-btn");

const allMenus = [mainMenu, subjectMenu, skinsMenu, controlsMenu];

function showMenu(menu) {
	allMenus.forEach((m) => m.classList.add("hidden"));
	menu.classList.remove("hidden");
	updateCoinDisplays();
}

function updateCoinDisplays() {
	mainMenuCoins.textContent = `Coins: ${state.coins}`;
	skinsMenuCoins.textContent = `Coins: ${state.coins}`;
}

/* ---------- Subject menu ---------- */

function renderSubjectMenu() {
	subjectList.innerHTML = "";
	Object.keys(QUESTIONS).forEach((subject) => {
		const btn = document.createElement("button");
		btn.className = "menu-button" + (state.subject === subject ? " active" : "");
		btn.textContent = subject;
		btn.onclick = () => {
			state.subject = subject;
			renderSubjectMenu();
		};
		subjectList.appendChild(btn);
	});
}

/* ---------- Skins menu ---------- */

function renderSkinsMenu() {
	skinsList.innerHTML = "";
	SKINS.forEach((skin) => {
		const owned = state.ownedSkins.includes(skin.id);
		const equipped = state.equippedSkin === skin.id;

		const row = document.createElement("div");
		row.className = "skin-row";

		const label = document.createElement("span");
		label.textContent = `${skin.name} ${skin.cost > 0 ? `(${skin.cost} coins)` : "(Free)"}`;
		row.appendChild(label);

		const btn = document.createElement("button");
		if (equipped) {
			btn.textContent = "Equipped";
			btn.disabled = true;
		} else if (owned) {
			btn.textContent = "Equip";
			btn.onclick = () => {
				state.equippedSkin = skin.id;
				renderSkinsMenu();
			};
		} else {
			btn.textContent = "Buy";
			btn.disabled = state.coins < skin.cost;
			btn.onclick = () => {
				if (state.coins < skin.cost) return;
				state.coins -= skin.cost;
				state.ownedSkins.push(skin.id);
				state.equippedSkin = skin.id;
				renderSkinsMenu();
			};
		}
		row.appendChild(btn);
		skinsList.appendChild(row);
	});
	updateCoinDisplays();
}

/* ---------- Menu navigation ---------- */

document.getElementById("subject-btn").onclick = () => {
	renderSubjectMenu();
	showMenu(subjectMenu);
};

document.getElementById("skins-btn").onclick = () => {
	renderSkinsMenu();
	showMenu(skinsMenu);
};

document.getElementById("controls-btn").onclick = () => {
	showMenu(controlsMenu);
};

document.querySelectorAll("[data-back]").forEach((btn) => {
	btn.onclick = () => showMenu(mainMenu);
});

document.getElementById("play-btn").onclick = () => {
	mainMenu.classList.add("hidden");
	gameContainer.classList.remove("hidden");
	go("game", { levelId: 0 });
};

updateCoinDisplays();

/* ============================================================
   QUESTION MODAL
   ============================================================ */

function askQuestion(onAnswered) {
	const q = getRandomQuestion(state.subject);
	const options = shuffle([q.correct, ...q.incorrect]);

	questionText.textContent = q.question;
	answerButtons.innerHTML = "";

	options.forEach((option) => {
		const btn = document.createElement("button");
		btn.className = "answer-btn";
		btn.textContent = option;
		btn.onclick = () => {
			questionModal.classList.add("hidden");
			onAnswered(option === q.correct);
		};
		answerButtons.appendChild(btn);
	});

	questionModal.classList.remove("hidden");
}

// Called after the player answers, from either a death or a level completion.
// - Correct: continues as normal — same level again after a death, or the
//   next level (or win) after completing one, via correctNextLevelId/isFinal.
// - Incorrect: always sends the player back to the very start (level 1),
//   regardless of whether the question came from a death or a portal.
function afterQuiz(correct, correctNextLevelId, isFinal) {
	if (correct) {
		state.coins += COINS_PER_CORRECT_ANSWER;
	}
	updateCoinDisplays();
	debug.paused = false;

	if (!correct) {
		go("game", { levelId: 0 });
	} else if (isFinal) {
		go("win");
	} else {
		go("game", { levelId: correctNextLevelId });
	}
}

/* ============================================================
   KAPLAY SETUP
   ============================================================ */

kaboom({
	width: 800,
	height: 450,
	root: gameContainer,
	background: [141, 183, 255],
});

loadSprite("blob", "sprites/blob.png")
loadSprite("bean", "sprites/bean.png")
loadSprite("devil", "sprites/devil.png")
loadSprite("zombie", "sprites/zombie.png")
loadSprite("spike", "sprites/spikes.png")
loadSprite("grass", "sprites/grass.png")
loadSprite("steel", "sprites/steel.png")
loadSprite("prize", "sprites/prize.png")
loadSprite("apple", "sprites/apple.png")
loadSprite("portal", "sprites/portal.png")
loadSprite("coin", "sprites/coin.png")
loadSprite("silver", "sprites/silver.png")
loadSprite("golden", "sprites/golden.png")
loadSprite("georgie", "sprites/georgie.png")

const BASE_GRAVITY = 3500

// Imported KAPLAY function controlling enemy patrol movement
function patrol(speed = 60, dir = 1) {
	return {
		id: "patrol",
		require: [ "pos", "area" ],
		add() {
			this.on("collide", (obj, col) => {
				if (col.isLeft() || col.isRight()) {
					dir = -dir
				}
			})
		},
		update() {
			this.move(speed * dir, 0)
		},
	}
}

// Imported KAPLAY function  that makes stuff grow big
function big() {
	let timer = 0
	let isBig = false
	let destScale = 1
	return {
		id: "big",
		require: [ "scale" ],
		update() {
			if (isBig) {
				timer -= dt()
				if (timer <= 0) {
					this.smallify()
				}
			}
			this.scale = this.scale.lerp(vec2(destScale), dt() * 6)
		},
		isBig() {
			return isBig
		},
		smallify() {
			destScale = 1
			timer = 0
			isBig = false
		},
		biggify(time) {
			destScale = 2
			timer = time
			isBig = true
		},
	}
}

// define some constants
const JUMP_FORCE = 1320
const MOVE_SPEED = 480
const FALL_DEATH = 2400

const LEVELS = [
	[
		"    0       ",
		"   --       ",
		"       $$   ",
		" %    ===   ",
		"            ",
		"   ^^  > = @",
		"============",
	],
	[
		"                          $",
		"                          $",
		"                          $",
		"                          $",
		"                          $",
		"           $$         =   $",
		"  %      ====         =   $",
		"                      =   $",
		"                      =    ",
		"       ^^      = >    =   @",
		"===========================",
	],
	[
		"     $  $    $   $    $    ",
		"     $  $    $   $    $    ",
		"                           ",
		"                           ",
		"                           ",
		"                           ",
		"                           ",
		" ^^^^>^^^^>^^^^>^^^^>^^^^^@",
		"===========================",
	],
]

// define what each symbol means in the level graph
const levelConf = {
	tileWidth: 64,
	tileHeight: 64,
	tiles: {
		"=": () => [
			sprite("grass"),
			area(),
			body({ isStatic: true }),
			anchor("bot"),
			offscreen({ hide: true }),
			"platform",
		],
		"-": () => [
			sprite("steel"),
			area(),
			body({ isStatic: true }),
			offscreen({ hide: true }),
			anchor("bot"),
		],
		"0": () => [
			sprite("devil"),
			area(),
			body({ isStatic: true }),
			offscreen({ hide: true }),
			anchor("bot"),
			"devil"
		],
		"$": () => [
			sprite("coin"),
			area(),
			pos(0, -9),
			anchor("bot"),
			offscreen({ hide: true }),
			"coin",
		],
		"%": () => [
			sprite("prize"),
			area(),
			body({ isStatic: true }),
			anchor("bot"),
			offscreen({ hide: true }),
			"prize",
		],
		"^": () => [
			sprite("spike"),
			area(),
			body({ isStatic: true }),
			anchor("bot"),
			offscreen({ hide: true }),
			"danger",
		],
		"#": () => [
			sprite("apple"),
			area(),
			anchor("bot"),
			body(),
			offscreen({ hide: true }),
			"apple",
		],
		">": () => [
			sprite("zombie"),
			area(),
			anchor("bot"),
			body(),
			patrol(),
			offscreen({ hide: true }),
			"enemy",
		],
		"@": () => [
			sprite("portal"),
			area({ scale: 0.7}),
			anchor("bot"),
			pos(0, -12),
			offscreen({ hide: true }),
			"portal",
		],
	},
}

scene("game", ({ levelId } = { levelId: 0 }) => {

	setGravity(BASE_GRAVITY)

	// add level to scene
	const level = addLevel(LEVELS[levelId ?? 0], levelConf)

	// define player object (uses whichever skin the player has equipped)
	const player = add([
		sprite(state.equippedSkin),
		pos(0, 0),
		area(),
		scale(1),
		body(),
		big(),
		anchor("bot"),
	])

	// debug.paused stops physics/gravity, but keyboard handlers still fire every
	// frame regardless — so movement is also gated behind this flag explicitly.
	// It doubles as the "movement disabled" flag for both quiz popups and ESC-pause.
	let inputLocked = false
	let isPaused = false

	function togglePause() {
		if (inputLocked && !isPaused) return // don't allow pausing while a quiz is open
		isPaused = !isPaused
		inputLocked = isPaused
		debug.paused = isPaused
		pauseModal.classList.toggle("hidden", !isPaused)
	}

	onKeyPress("escape", togglePause)

	resumeBtn.onclick = () => {
		if (isPaused) togglePause()
	}

	// IMPORTANT: debug.paused freezes KAPLAY's render loop entirely, not just
	// physics — so it must be explicitly turned back off here. Otherwise the
	// canvas stops drawing new frames the moment you pause, and the next
	// scene (even with a different skin equipped) never visibly appears —
	// the browser just keeps showing the last frozen frame from before pause.
	pauseMenuBtn.onclick = () => {
		isPaused = false
		inputLocked = false
		debug.paused = false
		pauseModal.classList.add("hidden")
		gameContainer.classList.add("hidden")
		showMenu(mainMenu)
	}

	// Pauses the game and shows a question. Whatever the outcome, the player
	// respawns — at the start of this level on death, or the next level
	// (or the win screen) after completing one.
	function die() {
		inputLocked = true
		debug.paused = true
		askQuestion((correct) => afterQuiz(correct, levelId, false))
	}

	player.onUpdate(() => {
		camPos(player.pos)
		if (player.pos.y >= FALL_DEATH) {
			die()
		}
	})

	player.onBeforePhysicsResolve((collision) => {
		if (collision.target.is(["platform", "soft"]) && player.isJumping()) {
			collision.preventResolution()
		}
	})

	player.onPhysicsResolve(() => {
		camPos(player.pos)
	})

	player.onCollide("danger", () => {
		die()
	})

	player.onCollide("portal", () => {
		inputLocked = true
		debug.paused = true
		const isFinalLevel = levelId + 1 >= LEVELS.length
		askQuestion((correct) => afterQuiz(correct, isFinalLevel ? null : levelId + 1, isFinalLevel))
	})

	player.onGround((l) => {
		if (l.is("enemy")) {
			player.jump(JUMP_FORCE * 1.5)
			destroy(l)
			addKaboom(player.pos)
		}
	})

	player.onCollide("enemy", (e, col) => {
		if (!col.isBottom()) {
			die()
		}
	})

	player.onCollide("devil", (e, col) => {
		
		die()
	
	})

	let hasApple = false

	player.onHeadbutt((obj) => {
		if (obj.is("prize") && !hasApple) {
			const apple = level.spawn("#", obj.tilePos.sub(0, 1))
			apple.jump()
			hasApple = true
		}
	})

	player.onCollide("apple", (a) => {
		destroy(a)
		player.biggify(3)
		hasApple = false
	})

	player.onCollide("coin", (c) => {
		destroy(c)
		state.coins += 1
		coinsLabel.text = "Coins: " + state.coins
	})

	const coinsLabel = add([
		text("Coins: " + state.coins),
		pos(24, 24),
		fixed(),
	])

	function jump() {
		if (inputLocked) return
		if (player.isGrounded()) {
			player.jump(JUMP_FORCE)
		}
	}

	onKeyPress("w", jump)

	onKeyDown("a", () => {
		if (inputLocked) return
		player.move(-MOVE_SPEED, 0)
	})

	onKeyDown("d", () => {
		if (inputLocked) return
		player.move(MOVE_SPEED, 0)
	})

	onKeyPress("s", () => {
		if (inputLocked) return
		player.weight = 3
	})

	onKeyRelease("s", () => {
		player.weight = 1
	})

	onGamepadButtonPress("south", jump)

	onGamepadStick("left", (v) => {
		if (inputLocked) return
		player.move(v.x * MOVE_SPEED, 0)
	})

	onKeyPress("f", () => {
		setFullscreen(!isFullscreen())
	})

})

scene("win", () => {
	add([
		text("You Win!"),
		pos(24, 24),
		fixed(),
	])
	onKeyPress(() => {
		gameContainer.classList.add("hidden")
		showMenu(mainMenu)
	})
})

// The game does not auto-start — it waits for "Play" on the main menu (see above).

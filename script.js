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
	playerName: "",
	coins: 0,
	subject: "Biology",
	ownedSkins: ["blob"],
	equippedSkin: "blob",
};

const COINS_PER_CORRECT_ANSWER = 5;

/* ============================================================
   QUESTIONS loaded from data/questions.json (an external data
   source)
   5 questions per subject, 1 correct + 3 incorrect. 
   Populated by loadQuestions() before the Play button is enabled (see below).
   ============================================================ */

let QUESTIONS = {};

async function loadQuestions() {
	const playBtn = document.getElementById("play-btn");
	try {
		const response = await fetch("data/questions.json");
		QUESTIONS = await response.json();
		playBtn.disabled = false;
		playBtn.textContent = "Play";
	} catch (err) {
		console.error("Failed to load questions.json:", err);
		playBtn.textContent = "Failed to load data";
	}
}

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

const nameEntryScreen = document.getElementById("name-entry-screen");
const playerNameInput = document.getElementById("player-name-input");
const nameError = document.getElementById("name-error");
const nameContinueBtn = document.getElementById("name-continue-btn");

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

/* ---------- Name entry ---------- */

/**
 * Validates the entered player name against three checks:
 * existence (not empty), type (letters only — no numbers, spaces, or
 * symbols), and range (3 to 15 characters). Returns an error message
 * string if invalid, or null if the name is valid.
 */
function validatePlayerName(rawName) {
	const name = rawName.trim();

	// Existence check
	if (name.length === 0) {
		return "Please enter a name.";
	}

	// Type check — letters only, no numbers, spaces, or symbols
	if (!/^[A-Za-z]+$/.test(name)) {
		return "Name can only contain letters (no numbers, spaces, or symbols).";
	}

	// Range check — between 3 and 15 characters
	if (name.length < 3 || name.length > 15) {
		return "Name must be between 3 and 15 characters.";
	}

	return null;
}

function submitPlayerName() {
	const error = validatePlayerName(playerNameInput.value);
	if (error) {
		nameError.textContent = error;
		nameError.classList.remove("hidden");
		return;
	}
	state.playerName = playerNameInput.value.trim();
	nameError.classList.add("hidden");
	nameEntryScreen.classList.add("hidden");
	showMenu(mainMenu);
}

nameContinueBtn.onclick = submitPlayerName;

playerNameInput.addEventListener("keydown", (e) => {
	if (e.key === "Enter") submitPlayerName();
});

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
loadQuestions();

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

// Setting Properties for game window
kaboom({
	width: 800,
	height: 450,
	root: gameContainer,
	background: [141, 183, 255],
});

// Sprites loaded from /sprites folder (64x64 png format)

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


/* ============================================================
   GAME LEVELS SET-UP
   ============================================================ */


// ASCII level graph
// Allows creating levels by representing each item/block as a symbol.
const LEVELS = [
	// Level 1
	[
		"    0       ",
		"   --       ",
		"       $$   ",
		" %    ===   ",
		"            ",
		"   ^^  > = @",
		"============",
	],
	// Level 2
	[
		"                          $",
		"                          $",
		"                          $",
		"                          $",
		"                          $",
		"           $$         -   $",
		"  %      ====         -   $",
		"                      -   $",
		"                      -    ",
		"   ^   ^^      = >    -   @",
		"===========================",
	],
	// Level 3
	[
		"     $  $    $   0    $    ",
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

	// Movement 
	// Tracked manually via onKeyPress/onKeyRelease
	// Movement always stops after pause/question box 
	// immediately and can only resume on a genuine new keypress.

	let movingLeft = false
	let movingRight = false

	function togglePause() {
		if (inputLocked && !isPaused) return // don't allow pausing while a quiz is open
		isPaused = !isPaused
		inputLocked = isPaused
		if (isPaused) {
			movingLeft = false
			movingRight = false
		}
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
		movingLeft = false
		movingRight = false
		debug.paused = false
		pauseModal.classList.add("hidden")
		gameContainer.classList.add("hidden")
		showMenu(mainMenu)
	}

	// Pauses the game and shows a question. Whatever the outcome, the player
	// respawns — at the start of this level on death, or the next level
	// (or the win screen) after completing one.
	//
	// Guarded by inputLocked so a single frame where two collisions happen
	// at once (e.g. touching a spike and the box tile together) can't fire
	// die() twice and stack two questions on top of each other.
	function die() {
		if (inputLocked) return
		inputLocked = true
		movingLeft = false
		movingRight = false
		debug.paused = true
		askQuestion((correct) => afterQuiz(correct, levelId, false))
	}
 
	// Runs every frame the player object exists. Keeps the camera locked to
	// the player (so the level scrolls with them), and checks whether they've
	// fallen off the bottom of the level — this is the only death condition
	// that isn't a collision, so it has to be polled here instead.
	player.onUpdate(() => {
		camPos(player.pos)
		if (player.pos.y >= FALL_DEATH) {
			die()
		}
	})
 
	// Lets the player jump UP through a platform/soft tile from underneath,
	// by cancelling the physics engine's collision response while they're
	// still rising. Without this, platform tiles would block the player
	// from both directions, making platforms impossible to jump onto from
	// below.
	player.onBeforePhysicsResolve((collision) => {
		if (collision.target.is(["platform", "soft"]) && player.isJumping()) {
			collision.preventResolution()
		}
	})
 
	// Physics resolution (gravity, collisions) can move the player after
	// onUpdate has already run this frame, so the camera is re-centred here
	// too — otherwise it would lag one frame behind the player during
	// collisions.
	player.onPhysicsResolve(() => {
		camPos(player.pos)
	})
 
	// Spikes and similar hazards are tagged "danger" in levelConf — touching
	// any of them is an instant death.
	player.onCollide("danger", () => {
		die()
	})
 
	// Reaching the level's portal tile either advances to the next level or,
	// on the final level, ends the game. Either way a question is asked
	// first (see askQuestion/afterQuiz above) — inputLocked guards against
	// this firing more than once if the collision is detected on two
	// consecutive frames before debug.paused actually takes effect.
	player.onCollide("portal", () => {
		if (inputLocked) return
		inputLocked = true
		movingLeft = false
		movingRight = false
		debug.paused = true
		const isFinalLevel = levelId + 1 >= LEVELS.length
		askQuestion((correct) => afterQuiz(correct, isFinalLevel ? null : levelId + 1, isFinalLevel))
	})
 
	// Landing on top of an enemy defeats it (a classic stomp mechanic): the
	// player bounces up higher than a normal jump, the enemy is removed,
	// and a small particle burst (addKaboom) plays at the point of contact.
	player.onGround((l) => {
		if (l.is("enemy")) {
			player.jump(JUMP_FORCE * 1.5)
			destroy(l)
			addKaboom(player.pos)
		}
	})
 
	// Touching an enemy from any side OTHER than directly on top (handled
	// separately above) is a death — this is what makes stomping enemies
	// safe but walking into them dangerous.
	player.onCollide("enemy", (e, col) => {
		if (!col.isBottom()) {
			die()
		}
	})
 
	// The box/"devil" tile is also a hazard — touching it from any direction
	// kills the player, unlike a normal platform tile.
	player.onCollide("devil", (e, col) => {
		
		die()
	
	})
 
	// Tracks whether the player is currently carrying the power-up apple
	// spawned from a "prize" block, so headbutting the same block twice in a
	// row doesn't spawn a second apple before the first has been collected.
	let hasApple = false
 
	// Hitting the underside of a "prize" block spawns a bonus apple above
	// it (mirroring the classic "hit block from below" power-up pattern).
	player.onHeadbutt((obj) => {
		if (obj.is("prize") && !hasApple) {
			const apple = level.spawn("#", obj.tilePos.sub(0, 1))
			apple.jump()
			hasApple = true
		}
	})
 
	// Collecting the apple grows the player temporarily (via the big()
	// component) and frees up hasApple so another one can be spawned later.
	player.onCollide("apple", (a) => {
		destroy(a)
		player.biggify(3)
		hasApple = false
	})
 
	// Coins are cosmetic currency, spent on skins in the shop menu. Picking
	// one up removes it from the level, adds to the player's running total,
	// and updates the on-screen HUD label to match.
	player.onCollide("coin", (c) => {
		destroy(c)
		state.coins += 1
		coinsLabel.text = "Coins: " + state.coins
	})
 
	// On-screen coin counter. fixed() keeps it pinned to the same screen
	// position regardless of where the camera is looking at in the level.
	const coinsLabel = add([
		text("Coins: " + state.coins),
		pos(24, 24),
		fixed(),
	])
 
	// Jumping is only allowed while grounded (no double-jumping) and while
	// input isn't locked (i.e. no quiz or pause menu is currently open).
	function jump() {
		if (inputLocked) return
		if (player.isGrounded()) {
			player.jump(JUMP_FORCE)
		}
	}
 
	onKeyPress("w", jump)
 
	// Left/right movement is tracked with these two boolean flags, set and
	// cleared on the actual keydown/keyup events, rather than checked by
	// polling "is the key currently down" every frame. This avoids a bug
	// where debug.paused (used to freeze the game for the quiz) can cause a
	// key release to be missed, leaving the player moving on its own after
	// respawning — see die()/togglePause() above, which force both flags
	// back to false the instant the game freezes.
	onKeyPress("a", () => {
		movingLeft = true
	})
 
	onKeyRelease("a", () => {
		movingLeft = false
	})
 
	onKeyPress("d", () => {
		movingRight = true
	})
 
	onKeyRelease("d", () => {
		movingRight = false
	})
 
	// Applies the held-direction flags above once per frame. Movement is
	// skipped entirely while inputLocked is true, so the player can't drift
	// while a question or the pause menu is on screen.
	onUpdate(() => {
		if (inputLocked) return
		if (movingLeft) player.move(-MOVE_SPEED, 0)
		if (movingRight) player.move(MOVE_SPEED, 0)
	})
 
	// Holding "s" increases the player's weight, making them fall faster —
	// released back to normal weight as soon as the key is let go.
	onKeyPress("s", () => {
		if (inputLocked) return
		player.weight = 3
	})
 
	onKeyRelease("s", () => {
		player.weight = 1
	})
 
 
	// Lets the player toggle browser fullscreen at any time, independent of
	// inputLocked, since it doesn't affect gameplay state.
	onKeyPress("f", () => {
		setFullscreen(!isFullscreen())
	})
 
})
 
// Shown after completing the final level. Displays the validated player
// name entered at the start and returns
// to the main menu on any keypress.
scene("win", () => {
	add([
		text("You Win! " + state.playerName),
		pos(64, 64),
		fixed(),
	])
	onKeyPress(() => {
		gameContainer.classList.add("hidden")
		showMenu(mainMenu)
	})
})
 
// The game does not auto-start — it waits for "Play" on the main menu (see above).

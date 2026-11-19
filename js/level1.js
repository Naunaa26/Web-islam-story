
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const $ = id => document.getElementById(id);

    const field = $("battlefield");
    const startButton = $("startButton");

    if (!field || !startButton) {
        console.error("Medan atau tombol mulai Badar tidak ditemukan.");
        return;
    }

    function ensureLayer(id, parent = field) {
        let layer = $(id);

        if (!layer) {
            layer = document.createElement("div");
            layer.id = id;
            parent.appendChild(layer);
        }

        return layer;
    }

    const unitsLayer = ensureLayer("unitsLayer");
    const duelLayer = ensureLayer("duelUnitsLayer");
    const angelLayer = ensureLayer("angelUnitsLayer");
    const divineLight = ensureLayer("divineLight");
    const lightParticles = ensureLayer("lightParticles", divineLight);

    const muslimLabel = $("muslimLabel");
    const qurayshLabel = $("qurayshLabel");
    const livesDisplay = $("lives");
    const timerDisplay = $("timer");
    const phaseText = $("phaseText");
    const sceneProgress = $("sceneProgress");

    const startPanel = $("startPanel");
    const quizPanel = $("quizPanel");
    const resultPanel = $("resultPanel");
    const rewardPanel = $("rewardPanel");
    const battleHint = $("battleHint");

    const questionTimer = $("questionTimer");
    const timerProgress = $("timerProgress");
    const resultIcon = $("resultIcon");
    const resultTitle = $("resultTitle");
    const resultText = $("resultText");
    const resultButton = $("resultButton");

    const answerButtons = [
        ...document.querySelectorAll(".answer")
    ];

    const gameMusic = $("gameMusic");
    const soundButton = $("soundButton");
    const rewardVideo = $("rewardVideo");
    const videoLoading = $("videoLoading");
    const videoMessage = $("videoMessage");
    const manualPlayButton = $("manualPlayButton");
    const nextButton = $("returnMapButton");

    const needed = {
        muslimLabel,
        qurayshLabel,
        livesDisplay,
        timerDisplay,
        phaseText,
        sceneProgress,
        startPanel,
        quizPanel,
        resultPanel,
        rewardPanel,
        battleHint,
        questionTimer,
        timerProgress,
        resultIcon,
        resultTitle,
        resultText,
        resultButton,
        gameMusic,
        soundButton,
        rewardVideo,
        videoLoading,
        videoMessage,
        manualPlayButton,
        nextButton
    };

    const missing = Object.entries(needed)
        .filter(([, element]) => !element)
        .map(([name]) => name);

    if (missing.length) {
        console.error(
            "Elemen HTML Badar belum cocok:",
            missing.join(", ")
        );

        return;
    }

    const battleDuration = 20000;
    const quizDuration = 10000;
    const videoStartTime = 20;
    const musicStartTime = 1;
    const musicEndTime = 21;
    const maxLives = 3;

    const soldiers = [];
    const fighters = [];
    const helpers = [];

    const phases = [
        [
            0,
            "ready",
            "01 — DUA PASUKAN BERSIAP"
        ],
        [
            1800,
            "duel",
            "02 — TIGA PEJUANG DARI KEDUA PIHAK MAJU"
        ],
        [
            3500,
            "duel-fight",
            "03 — DUEL PEMBUKA TIGA LAWAN TIGA"
        ],
        [
            5600,
            "duel-end",
            "04 — DUEL PEMBUKA BERAKHIR"
        ],
        [
            7000,
            "advance",
            "05 — KEDUA PASUKAN MAJU DALAM FORMASI"
        ],
        [
            10000,
            "contact",
            "06 — BARISAN PASUKAN MULAI BERTEMU"
        ],
        [
            11100,
            "scatter",
            "07 — BENTROKAN MEMECAH BARISAN"
        ],
        [
            12500,
            "angels",
            "08 — PERTOLONGAN ALLAH: 1.000 MALAIKAT"
        ],
        [
            15600,
            "retreat",
            "09 — QURAISY TERDESAK DAN MUNDUR"
        ],
        [
            18000,
            "victory",
            "10 — PASUKAN MUSLIM MERAIH KEMENANGAN"
        ]
    ];

    let lives = maxLives;
    let musicEnabled = true;
    let battleActive = false;
    let quizActive = false;
    let gameOver = false;
    let rewardActive = false;
    let rewardReady = false;
    let rewardAttempting = false;
    let rewardAutoAttempted = false;

    let elapsed = 0;
    let battleFrame = null;
    let quizFrame = null;
    let token = 0;
    let lastPhase = -1;

    const clamp = (n, a, b) =>
        Math.max(a, Math.min(b, n));

    const lerp = (a, b, t) =>
        a + (b - a) * t;

    const ease = t => {
        const x = clamp(t, 0, 1);
        return x * x * (3 - 2 * x);
    };

    const random = seed => {
        const n =
            Math.sin(seed * 127.1 + 78.233) *
            43758.5453;

        return n - Math.floor(n);
    };

    const range = (seed, a, b) =>
        lerp(a, b, random(seed));

    const between = (a, b, t) => ({
        x: lerp(a.x, b.x, ease(t)),
        y: lerp(a.y, b.y, ease(t))
    });

    function move(node, x, y, scale = 1) {
        node.style.transform =
            `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }

    function buildLandscape() {
        for (const item of field.querySelectorAll("*")) {
            if (
                item.children.length === 0 &&
                item.textContent.trim().toUpperCase() ===
                    "DUA SUMUR DI GURUN"
            ) {
                item.style.display = "none";
            }
        }

        const decor = document.createElement("div");

        decor.id = "badarDecor";

        decor.innerHTML = `
            <div class="badar-wells-title">
                DUA SUMUR DI GURUN
            </div>

            <div class="badar-well-visual well-one">
                <span></span>
            </div>

            <div class="badar-well-visual well-two">
                <span></span>
            </div>

            <div class="badar-palm palm-one">
                <i></i>
            </div>

            <div class="badar-palm palm-two">
                <i></i>
            </div>

            <div class="badar-rock-visual rock-one"></div>
            <div class="badar-rock-visual rock-two"></div>
            <div class="badar-rock-visual rock-three"></div>

            <div class="badar-trail"></div>

            <div class="badar-date">
                17 RAMADAN · 2 H
            </div>
        `;

        field.prepend(decor);

        if (!divineLight.querySelector(".badar-light-title")) {
            const text = document.createElement("div");

            text.className = "badar-light-title";

            text.textContent =
                "PERTOLONGAN ALLAH · 1.000 MALAIKAT";

            divineLight.appendChild(text);
        }

        const badge = document.createElement("div");

        badge.id = "badarDuelBadge";

        badge.innerHTML =
            "DUEL PEMBUKA <strong>3 VS 3</strong>";

        field.appendChild(badge);
    }

    function buildArmy(green, count) {
        for (let i = 0; i < count; i++) {
            const col = i % 6;
            const row = Math.floor(i / 6);
            const seed = i + (green ? 42 : 142);

            const x = green
                ? 155 + col * 23
                : 845 - col * 23;

            const y = 330 + row * 27;

            const angle = range(
                seed,
                0,
                Math.PI * 2
            );

            const radius = range(
                seed + 1,
                30,
                138
            );

            const node = document.createElement("span");

            node.className =
                "badar-unit " +
                (green ? "unit-green" : "unit-red");

            node.setAttribute("aria-hidden", "true");

            unitsLayer.appendChild(node);

            soldiers.push({
                node,
                green,
                seed,

                first: {
                    x,
                    y
                },

                march: {
                    x: x + (green ? 205 : -205),
                    y
                },

                contact: {
                    x: x + (green ? 255 : -255),
                    y
                },

                clash: {
                    x: 500 + Math.cos(angle) * radius,
                    y: 385 +
                        Math.sin(angle) * radius * .56
                },

                regroup: {
                    x: (green ? 397 : 685) + col * 22,
                    y: 322 + row * 27
                },

                final: {
                    x: (green ? 443 : 840) + col * 22,
                    y: 322 + row * 27
                }
            });
        }
    }

    function buildDuel() {
        const names = [
            ["Hamzah", "Hamzah bin Abdul Muthalib"],
            ["Ali", "Ali bin Abi Thalib"],
            ["Ubaidah", "Ubaidah bin Harits"],
            ["Utbah", "Utbah bin Rabi'ah"],
            ["Syaibah", "Syaibah bin Rabi'ah"],
            ["Al-Walid", "Al-Walid bin Utbah"]
        ];

        for (let i = 0; i < names.length; i++) {
            const green = i < 3;
            const row = i % 3;

            const node = document.createElement("span");
            const chip = document.createElement("span");

            node.className =
                "badar-duel-fighter " +
                (green ? "muslim" : "quraysh");

            chip.className = "duel-name";
            chip.textContent = names[i][0];

            node.title = names[i][1];
            chip.title = names[i][1];

            node.appendChild(chip);
            duelLayer.appendChild(node);

            fighters.push({
                node,
                green,
                row
            });
        }
    }

    function buildHelpers() {
        for (let i = 0; i < 24; i++) {
            const node = document.createElement("span");

            node.className = "badar-angel-unit";

            node.setAttribute(
                "aria-hidden",
                "true"
            );

            angelLayer.appendChild(node);

            helpers.push({
                node,
                seed: i,

                start: {
                    x: i % 3 === 0
                        ? -45
                        : 150 + i * 23,

                    y: i % 3 === 0
                        ? 290 + i * 7
                        : -50
                },

                goal: {
                    x: 347 + (i % 8) * 29,
                    y: 290 + Math.floor(i / 8) * 57
                },

                from: 12500 + (i % 8) * 95
            });
        }

        for (let i = 0; i < 28; i++) {
            const light = document.createElement("span");

            light.className = "light-particle";

            light.style.left =
                range(i + 41, 20, 82) + "%";

            light.style.top =
                range(i + 71, 26, 77) + "%";

            light.style.animationDelay =
                (i % 9) * -.24 + "s";

            lightParticles.appendChild(light);
        }
    }

    function positionArmy(u, t) {
        if (t < 7000) {
            return u.first;
        }

        if (t < 10000) {
            return between(
                u.first,
                u.march,
                (t - 7000) / 3000
            );
        }

        if (t < 11100) {
            return between(
                u.march,
                u.contact,
                (t - 10000) / 1100
            );
        }

        if (t < 15600) {
            const p = between(
                u.contact,
                u.clash,
                (t - 11100) / 4500
            );

            const wobble = Math.sin(
                Math.PI * clamp(
                    (t - 11100) / 4500,
                    0,
                    1
                )
            );

            p.x += Math.sin(
                t / 190 + u.seed
            ) * 11 * wobble;

            p.y += Math.cos(
                t / 215 + u.seed
            ) * 8 * wobble;

            return p;
        }

        if (t < 18000) {
            return between(
                u.clash,
                u.regroup,
                (t - 15600) / 2400
            );
        }

        return between(
            u.regroup,
            u.final,
            (t - 18000) / 2000
        );
    }

    function updateFighters(t) {
        fighters.forEach(u => {
            const y = 330 + u.row * 48;

            const from = u.green ? 405 : 595;
            const ready = u.green ? 445 : 555;
            const clash = u.green ? 486 : 514;

            let x = from;

            if (t >= 1800 && t < 3500) {
                x = lerp(
                    from,
                    ready,
                    ease((t - 1800) / 1700)
                );
            } else if (t >= 3500 && t < 5600) {
                x = lerp(
                    ready,
                    clash,
                    ease((t - 3500) / 2100)
                );

                x += Math.sin(
                    t / 130 + u.row * 2.7
                ) * 4;
            } else if (t >= 5600) {
                x = lerp(
                    clash,
                    ready,
                    ease((t - 5600) / 1400)
                );
            }

            move(u.node, x, y);
        });
    }

    
function updateHelpers(t) {
    helpers.forEach((u, i) => {
        if (t < u.from) {
            u.node.style.opacity = "0";

            move(
                u.node,
                u.start.x,
                u.start.y
            );

            return;
        }

        const ally = soldiers[
            (i * 5 + 2) % 30
        ];

        const enemy = soldiers[
            30 + (i * 7 + 3) % 36
        ];

        const allyPos = positionArmy(ally, t);
        const enemyPos = positionArmy(enemy, t);

        const time = t - u.from;

        const arrival = ease(
            time / 1050
        );

        const battleMotion = ease(
            (time - 500) / 650
        );

        const retreatMotion = ease(
            (t - 15600) / 1800
        );

        const waveX = Math.sin(
            time / 210 + i * 1.7
        );

        const waveY = Math.cos(
            time / 260 + i * 2.1
        );

        const swingX =
            waveX * (13 + i % 5 * 3);

        const swingY =
            waveY * (10 + i % 4 * 3);

        const battleX = lerp(
            allyPos.x,
            enemyPos.x,
            .58
        ) + swingX;

        const battleY = lerp(
            allyPos.y,
            enemyPos.y,
            .58
        ) + swingY;

        const chaseX =
            enemyPos.x -
            17 -
            (i % 4) * 8 +
            Math.sin(
                time / 160 + i
            ) * 11;

        const chaseY =
            enemyPos.y +
            ((i % 3) - 1) * 15 +
            Math.cos(
                time / 195 + i
            ) * 9;

        const targetX = lerp(
            battleX,
            chaseX,
            retreatMotion
        );

        const targetY = lerp(
            battleY,
            chaseY,
            retreatMotion
        );

        const entryTargetX = lerp(
            allyPos.x - 22,
            targetX,
            battleMotion
        );

        const entryTargetY = lerp(
            allyPos.y,
            targetY,
            battleMotion
        );

        const x = lerp(
            u.start.x,
            entryTargetX,
            arrival
        );

        const y = lerp(
            u.start.y,
            entryTargetY,
            arrival
        );

        const fighting =
            t >= 13700 &&
            t < 18100;

        const pulse = fighting
            ? 1 + Math.sin(
                time / 105 + i * 2
            ) * .16
            : 1;

        const fade = clamp(
            (19600 - t) / 1600,
            0,
            1
        );

        const glow = fighting
            ? .85 + Math.sin(
                time / 140 + i
            ) * .15
            : .9;

        u.node.style.opacity = String(
            arrival * fade * glow
        );

        move(
            u.node,
            x,
            y,
            pulse
        );
    });
}

    function updateLabels(t) {
        let x1 = 218;
        let x2 = 785;

        if (t >= 7000 && t < 10000) {
            const p = ease(
                (t - 7000) / 3000
            );

            x1 = lerp(218, 422, p);
            x2 = lerp(785, 580, p);
        } else if (
            t >= 10000 &&
            t < 15600
        ) {
            x1 = 422;
            x2 = 580;
        } else if (t >= 15600) {
            const p = ease(
                (t - 15600) / 4400
            );

            x1 = lerp(422, 488, p);
            x2 = lerp(580, 852, p);
        }

        muslimLabel.style.left = x1 + "px";
        qurayshLabel.style.left = x2 + "px";

        const visible =
            t >= 9850 && t < 15600
                ? "0"
                : "1";

        muslimLabel.style.opacity = visible;
        qurayshLabel.style.opacity = visible;
    }

    function updateBattle(t) {
        soldiers.forEach(u => {
            const p = positionArmy(u, t);

            move(
                u.node,
                p.x,
                p.y
            );
        });

        updateFighters(t);
        updateHelpers(t);
        updateLabels(t);

        let current = 0;

        for (let i = 0; i < phases.length; i++) {
            if (t >= phases[i][0]) {
                current = i;
            }
        }

        if (current !== lastPhase) {
            lastPhase = current;

            field.dataset.scene =
                phases[current][1];

            phaseText.textContent =
                phases[current][2];
        }

        sceneProgress.style.width =
            t / battleDuration * 100 + "%";
    }

    function updateLives() {
        livesDisplay.textContent =
            "❤️".repeat(lives) +
            "🖤".repeat(maxLives - lives);
    }

    function updateSound() {
        soundButton.textContent =
            musicEnabled
                ? "🔊 Musik ON"
                : "🔇 Musik OFF";

        soundButton.setAttribute(
            "aria-pressed",
            String(musicEnabled)
        );
    }

    function stopMusic() {
        gameMusic.pause();

        try {
            gameMusic.currentTime = 0;
        } catch (error) {
            gameMusic.load();
        }
    }

    function playMusic() {
        if (
            !musicEnabled ||
            !battleActive ||
            elapsed >= battleDuration
        ) {
            return;
        }

        gameMusic.volume = 1;

        if (
            gameMusic.readyState >= 1 &&
            gameMusic.currentTime < musicStartTime
        ) {
            try {
                gameMusic.currentTime = musicStartTime;
            } catch (error) {}
        }

        if (gameMusic.currentTime >= musicEndTime) {
            return;
        }

        const attempt = gameMusic.play();

        if (attempt) {
            attempt.catch(() => {});
        }
    }

    function stopFrames() {
        if (battleFrame !== null) {
            cancelAnimationFrame(battleFrame);
        }

        if (quizFrame !== null) {
            cancelAnimationFrame(quizFrame);
        }

        battleFrame = null;
        quizFrame = null;
    }

    function startBattle() {
        stopFrames();
        stopMusic();
        rewardVideo.pause();

        token++;

        const thisRun = token;

        elapsed = 0;
        lastPhase = -1;

        battleActive = true;
        quizActive = false;
        gameOver = false;
        rewardActive = false;

        if (lives <= 0) {
            lives = maxLives;
        }

        for (const panel of [
            startPanel,
            quizPanel,
            resultPanel,
            rewardPanel
        ]) {
            panel.classList.add("hidden");
        }

        battleHint.classList.remove("hidden");
        timerDisplay.textContent = "--";

        updateLives();
        updateBattle(0);
        playMusic();

        const startedAt = performance.now();

        function tick(now) {
            if (
                !battleActive ||
                thisRun !== token
            ) {
                return;
            }

            elapsed = clamp(
                now - startedAt,
                0,
                battleDuration
            );

            updateBattle(elapsed);

            if (
                gameMusic.currentTime >= musicEndTime &&
                !gameMusic.paused
            ) {
                stopMusic();
            }

            if (elapsed < battleDuration) {
                battleFrame =
                    requestAnimationFrame(tick);
            } else {
                battleActive = false;
                battleFrame = null;

                stopMusic();

                battleHint.classList.add("hidden");

                showQuiz();
            }
        }

        battleFrame = requestAnimationFrame(tick);
    }

    function showQuiz() {
        if (gameOver) {
            return;
        }

        quizActive = true;

        resultPanel.classList.add("hidden");
        quizPanel.classList.remove("hidden");

        answerButtons.forEach(button => {
            button.disabled = false;
        });

        if (quizFrame !== null) {
            cancelAnimationFrame(quizFrame);
        }

        const limit =
            performance.now() + quizDuration;

        function tick(now) {
            if (!quizActive) {
                return;
            }

            const remaining = Math.max(
                0,
                limit - now
            );

            const seconds =
                Math.ceil(remaining / 1000);

            timerDisplay.textContent =
                seconds + "s";

            questionTimer.textContent =
                seconds + " DETIK";

            timerProgress.style.width =
                remaining / quizDuration * 100 + "%";

            timerProgress.style.background =
                remaining <= 3000
                    ? "#b9483d"
                    : "#c5a46a";

            if (remaining > 0) {
                quizFrame =
                    requestAnimationFrame(tick);
            } else {
                quizFrame = null;

                finishAnswer();
                loseLife("Waktu Habis!");
            }
        }

        timerDisplay.textContent = "10s";
        questionTimer.textContent = "10 DETIK";
        timerProgress.style.width = "100%";

        quizFrame =
            requestAnimationFrame(tick);
    }

    function finishAnswer() {
        if (!quizActive) {
            return;
        }

        quizActive = false;

        if (quizFrame !== null) {
            cancelAnimationFrame(quizFrame);
        }

        quizFrame = null;

        answerButtons.forEach(button => {
            button.disabled = true;
        });
    }

    function showResult(
        title,
        text,
        actionText,
        action
    ) {
        quizPanel.classList.add("hidden");
        resultPanel.classList.remove("hidden");

        resultIcon.textContent = "✕";
        resultIcon.classList.add("wrong");

        resultTitle.textContent = title;
        resultText.textContent = text;

        resultButton.textContent = actionText;
        resultButton.onclick = action;
    }

    function loseLife(title) {
        lives = Math.max(0, lives - 1);

        updateLives();

        if (!lives) {
            gameOver = true;

            showResult(
                "Game Over!",
                "Semua nyawa habis.",
                "Ulangi Ekspedisi",
                () => {
                    lives = maxLives;
                    startBattle();
                }
            );
        } else {
            showResult(
                title,
                "Sisa nyawa: " + lives,
                "Coba Lagi",
                showQuiz
            );
        }
    }

    function unlockLevelTwo() {
        const key =
            "islamStoryUnlockedLevel=";

        const saved = document.cookie
            .split(";")
            .map(s => s.trim())
            .find(s => s.startsWith(key));

        const value = saved
            ? Number.parseInt(
                saved.slice(key.length),
                10
            )
            : 1;

        const level = Number.isFinite(value)
            ? value
            : 1;

        document.cookie =
            `islamStoryUnlockedLevel=${Math.max(level, 2)}; Max-Age=31536000; Path=/; SameSite=Lax`;
    }

    function checkAnswer(answer) {
        if (!quizActive || gameOver) {
            return;
        }

        finishAnswer();

        if (answer === "A") {
            unlockLevelTwo();
            showReward();
        } else {
            loseLife("Jawaban Salah!");
        }
    }

    function nextLevel() {
        token++;

        battleActive = false;
        quizActive = false;
        rewardActive = false;

        stopFrames();
        stopMusic();
        rewardVideo.pause();

        window.location.href = "level2.html";
    }

    function showVideoFailure(message) {
        if (!rewardActive) {
            return;
        }

        videoLoading.classList.add("hidden");

        videoMessage.textContent = message;
        videoMessage.classList.remove("hidden");

        manualPlayButton.classList.add("hidden");
        nextButton.classList.remove("hidden");
    }

    async function playReward() {
        if (
            !rewardActive ||
            !rewardReady ||
            rewardAttempting ||
            rewardVideo.seeking
        ) {
            return;
        }

        if (
            rewardVideo.currentTime <
            videoStartTime - .25
        ) {
            return;
        }

        rewardAttempting = true;

        manualPlayButton.classList.add("hidden");

        try {
            rewardVideo.muted = false;
            rewardVideo.volume = 1;

            await rewardVideo.play();

            if (!rewardActive) {
                rewardVideo.pause();
                return;
            }

            videoLoading.classList.add("hidden");
            videoMessage.classList.add("hidden");
        } catch (error) {
            if (rewardActive) {
                videoLoading.classList.add("hidden");

                videoMessage.textContent =
                    "Browser memblokir pemutaran otomatis bersuara. Tekan Putar Video.";

                videoMessage.classList.remove("hidden");
                manualPlayButton.classList.remove("hidden");
            }
        } finally {
            rewardAttempting = false;
        }
    }

    function autoReward() {
        if (
            !rewardActive ||
            !rewardReady ||
            rewardAutoAttempted ||
            rewardVideo.seeking
        ) {
            return;
        }

        if (
            rewardVideo.currentTime <
            videoStartTime - .25
        ) {
            return;
        }

        rewardAutoAttempted = true;

        playReward();
    }

    function showReward() {
        rewardActive = true;
        gameOver = true;

        rewardReady = false;
        rewardAttempting = false;
        rewardAutoAttempted = false;

        stopMusic();
        stopFrames();

        quizPanel.classList.add("hidden");
        resultPanel.classList.add("hidden");
        rewardPanel.classList.remove("hidden");

        videoLoading.classList.remove("hidden");
        videoMessage.classList.add("hidden");
        manualPlayButton.classList.add("hidden");

        nextButton.classList.remove("hidden");
        nextButton.textContent = "Next →";

        rewardVideo.pause();
        rewardVideo.controls = false;
        rewardVideo.autoplay = false;
        rewardVideo.loop = false;

        rewardVideo.load();
    }

    startButton.addEventListener(
        "click",
        startBattle
    );

    answerButtons.forEach(button => {
        button.addEventListener("click", () => {
            checkAnswer(button.dataset.answer);
        });
    });

    soundButton.addEventListener("click", () => {
        musicEnabled = !musicEnabled;

        updateSound();

        if (musicEnabled) {
            playMusic();
        } else {
            gameMusic.pause();
        }
    });

    gameMusic.addEventListener(
        "loadedmetadata",
        () => {
            if (
                battleActive &&
                gameMusic.currentTime < musicStartTime
            ) {
                gameMusic.currentTime =
                    musicStartTime;
            }
        }
    );

    rewardVideo.addEventListener(
        "loadedmetadata",
        () => {
            if (!rewardActive || rewardReady) {
                return;
            }

            if (
                !Number.isFinite(rewardVideo.duration) ||
                rewardVideo.duration <= videoStartTime
            ) {
                showVideoFailure(
                    "Video hadiah harus lebih panjang dari 20 detik."
                );

                return;
            }

            rewardReady = true;

            rewardVideo.currentTime =
                videoStartTime;
        }
    );

    rewardVideo.addEventListener(
        "seeked",
        autoReward
    );

    rewardVideo.addEventListener(
        "canplay",
        autoReward
    );

    rewardVideo.addEventListener(
        "ended",
        nextLevel
    );

    rewardVideo.addEventListener("error", () => {
        if (rewardActive) {
            showVideoFailure(
                "Periksa assets/reward-badar.mp4."
            );
        }
    });

    manualPlayButton.addEventListener(
        "click",
        playReward
    );

    nextButton.addEventListener(
        "click",
        nextLevel
    );

    window.addEventListener("pagehide", () => {
        token++;

        battleActive = false;
        quizActive = false;
        rewardActive = false;

        stopFrames();
        stopMusic();
        rewardVideo.pause();
    });

    buildLandscape();
    buildArmy(true, 30);
    buildArmy(false, 36);
    buildDuel();
    buildHelpers();

    updateLives();
    updateSound();
    updateBattle(0);
});

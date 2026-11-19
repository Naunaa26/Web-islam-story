
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const get = id => document.getElementById(id);

    const field = get("battlefield");
    const muslimLayer = get("muslimLayer");
    const defenderLayer = get("defenderLayer");
    const wallGuardLayer = get("wallGuardLayer");
    const arrowLayer = get("arrowLayer");
    const effectsLayer = get("effectsLayer");

    const muslimStandard = get("muslimStandard");
    const defenderStandard = get("defenderStandard");

    const muslimLabel = get("muslimLabel");
    const defenderLabel = get("defenderLabel");

    const storyCard = get("storyCard");
    const gateAlert = get("gateAlert");
    const frontImpact = get("frontImpact");
    const gateImpact = get("gateImpact");

    const phaseText = get("phaseText");
    const sceneProgress = get("sceneProgress");
    const battleHint = get("battleHint");

    const livesDisplay = get("lives");
    const timerDisplay = get("timer");

    const startPanel = get("startPanel");
    const startButton = get("startButton");

    const quizPanel = get("quizPanel");
    const questionTimer = get("questionTimer");
    const timerProgress = get("timerProgress");

    const resultPanel = get("resultPanel");
    const resultIcon = get("resultIcon");
    const resultTitle = get("resultTitle");
    const resultText = get("resultText");
    const resultButton = get("resultButton");

    const rewardPanel = get("rewardPanel");
    const rewardVideo = get("rewardVideo");
    const videoLoading = get("videoLoading");
    const videoMessage = get("videoMessage");
    const manualPlayButton = get("manualPlayButton");
    const nextButton = get("returnMapButton");

    const gameMusic = get("gameMusic");
    const soundButton = get("soundButton");

    const answerButtons = [
        ...document.querySelectorAll(".answer")
    ];

    const required = {
        field,
        muslimLayer,
        defenderLayer,
        wallGuardLayer,
        arrowLayer,
        effectsLayer,
        muslimStandard,
        defenderStandard,
        muslimLabel,
        defenderLabel,
        storyCard,
        gateAlert,
        frontImpact,
        gateImpact,
        phaseText,
        sceneProgress,
        battleHint,
        livesDisplay,
        timerDisplay,
        startPanel,
        startButton,
        quizPanel,
        questionTimer,
        timerProgress,
        resultPanel,
        resultIcon,
        resultTitle,
        resultText,
        resultButton,
        rewardPanel,
        rewardVideo,
        videoLoading,
        videoMessage,
        manualPlayButton,
        nextButton,
        gameMusic,
        soundButton
    };

    const missing = Object.entries(required)
        .filter(([, value]) => !value)
        .map(([name]) => name);

    if (missing.length) {
        console.error(
            "Elemen Level 4 tidak ditemukan:",
            missing.join(", ")
        );
        return;
    }

    const battleDuration = 20000;
    const quizDuration = 10000;
    const musicStopTime = 14000;
    const videoStartTime = 10;
    const musicVolume = 1;
    const correctAnswer = "D";
    const maxLives = 3;
    const progressKey = "islamStoryUnlockedLevel";

    const phases = [
        {
            time: 0,
            scene: "ready",
            text: "01 — PASUKAN BERSIAP DI DEPAN BENTENG",
            title: "PERSIAPAN PERTAHANAN",
            detail: "PENJAGA MENEMPATI TEMBOK DAN GERBANG"
        },
        {
            time: 2000,
            scene: "advance",
            text: "02 — PASUKAN MUSLIM MENDEKATI BENTENG",
            title: "PERGERAKAN PASUKAN",
            detail: "PASUKAN BERGERAK MENUJU PERTAHANAN"
        },
        {
            time: 5000,
            scene: "contact",
            text: "03 — PEMANAH BENTENG MULAI MENYERANG",
            title: "SERANGAN DARI TEMBOK",
            detail: "PENJAGA BENTENG MELEPASKAN PANAH"
        },
        {
            time: 6500,
            scene: "clash",
            text: "04 — BENTROKAN TERJADI DI DEPAN GERBANG",
            title: "BENTROKAN DI JALUR MASUK",
            detail: "PENJAGA MENAHAN BARISAN PASUKAN"
        },
        {
            time: 8500,
            scene: "banner",
            text: "05 — ALI BIN ABI THALIB MEMBAWA PANJI",
            title: "PEMBAWA PANJI",
            detail: "ALI BIN ABI THALIB MEMIMPIN GERAK MAJU"
        },
        {
            time: 11000,
            scene: "push",
            text: "06 — PENJAGA TERDESAK MENUJU GERBANG",
            title: "SERANGAN MENUJU BENTENG",
            detail: "PASUKAN MUSLIM MENDESAK PERTAHANAN"
        },
        {
            time: 14000,
            scene: "breach",
            text: "07 — GERBANG BENTENG MULAI TERBUKA",
            title: "PERTAHANAN GERBANG",
            detail: "PINTU GERBANG BERHASIL DIBUKA"
        },
        {
            time: 16500,
            scene: "enter",
            text: "08 — PASUKAN MEMASUKI KOMPLEKS BENTENG",
            title: "MASUK KE AREA BENTENG",
            detail: "PASUKAN BERGERAK MELALUI GERBANG"
        },
        {
            time: 18500,
            scene: "secured",
            text: "09 — BENTENG BERHASIL DIKUASAI",
            title: "PERTAHANAN DIKUASAI",
            detail: "PERTEMPURAN MEMASUKI TAHAP AKHIR"
        }
    ];

    const muslims = [];
    const defenders = [];
    const wallGuards = [];
    const arrows = [];
    const sparks = [];

    let lives = maxLives;
    let musicEnabled = true;

    let battleActive = false;
    let quizActive = false;
    let gameOver = false;
    let rewardActive = false;

    let elapsed = 0;
    let battleFrame = null;
    let quizFrame = null;
    let battleToken = 0;
    let lastPhase = -1;

    let videoReady = false;
    let videoAutoAttempted = false;
    let videoAttempting = false;

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const mix = (a, b, amount) =>
        a + (b - a) * amount;

    function ease(value) {
        const t = clamp(value, 0, 1);
        return t * t * (3 - 2 * t);
    }

    function noise(seed) {
        const n =
            Math.sin(seed * 127.1 + 78.233) *
            43758.5453;

        return n - Math.floor(n);
    }

    function range(seed, a, b) {
        return mix(a, b, noise(seed));
    }

    function between(a, b, amount) {
        const p = ease(amount);

        return {
            x: mix(a.x, b.x, p),
            y: mix(a.y, b.y, p)
        };
    }

    function move(node, x, y, scale = 1) {
        node.style.transform =
            `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }

    function createArmy(side, count) {
        const green = side === "muslim";
        const group = green ? muslims : defenders;
        const layer = green ? muslimLayer : defenderLayer;

        for (let i = 0; i < count; i++) {
            const col = i % 6;
            const row = Math.floor(i / 6);
            const seed = i + (green ? 31 : 131);

            const node = document.createElement("span");

            node.className =
                "khaibar-unit " +
                (green ? "muslim" : "defender");

            node.setAttribute("aria-hidden", "true");
            layer.appendChild(node);

            const startY = green
                ? 355 + row * 25
                : 367 + row * 28;

            group.push({
                node,
                green,
                seed,
                col,
                row,

                start: {
                    x: green
                        ? 120 + col * 23
                        : 635 + col * 22,
                    y: startY
                },

                march: {
                    x: green
                        ? 310 + col * 24
                        : 635 + col * 22,
                    y: startY
                },

                contact: {
                    x: green
                        ? 465 + col * 21
                        : 620 + col * 22,
                    y: startY
                },

                clash: {
                    x: green
                        ? 525 + col * 20
                        : 610 + col * 19,
                    y: startY
                },

                push: {
                    x: green
                        ? 630 + col * 18
                        : 705 + col * 18,
                    y: startY
                },

                gate: {
                    x: green
                        ? 708 + col * 8
                        : 750 + col * 10,
                    y: green
                        ? 375 + (row - 2) * 13
                        : 375 + (row - 1) * 17
                },

                enter: {
                    x: green
                        ? 758 + (col - 2.5) * 6
                        : 823 + col * 8,
                    y: green
                        ? 375 + (row - 2) * 10
                        : 375 + (row - 1) * 15
                },

                finish: {
                    x: green
                        ? 771 + (col - 2.5) * 5
                        : 862 + col * 8,
                    y: green
                        ? 375 + (row - 2) * 8
                        : 375 + (row - 1) * 15
                }
            });
        }
    }

    function createWallGuards() {
        const positions = [
            [582, 205],
            [633, 247],
            [679, 247],
            [711, 247],
            [813, 247],
            [865, 247],
            [935, 205]
        ];

        positions.forEach(([x, y], i) => {
            const node = document.createElement("span");

            node.className = "khaibar-wall-guard";
            node.setAttribute("aria-hidden", "true");

            wallGuardLayer.appendChild(node);

            wallGuards.push({
                node,
                index: i,
                x,
                y
            });
        });
    }

    function createArrows() {
        for (let i = 0; i < 15; i++) {
            const node = document.createElement("span");

            node.className = "khaibar-arrow";
            node.setAttribute("aria-hidden", "true");

            arrowLayer.appendChild(node);

            arrows.push({
                node,
                index: i
            });
        }
    }

    function createSparks() {
        for (let i = 0; i < 18; i++) {
            const node = document.createElement("span");

            node.className = "khaibar-spark";
            node.setAttribute("aria-hidden", "true");

            effectsLayer.appendChild(node);

            sparks.push({
                node,
                index: i,
                angle: range(
                    i + 21,
                    0,
                    Math.PI * 2
                ),
                radius: range(
                    i + 46,
                    15,
                    60
                )
            });
        }
    }

    function positionOf(unit, t) {
        if (t < 2000) {
            return unit.start;
        }

        if (t < 5000) {
            return between(
                unit.start,
                unit.march,
                (t - 2000) / 3000
            );
        }

        if (t < 6500) {
            return between(
                unit.march,
                unit.contact,
                (t - 5000) / 1500
            );
        }

        if (t < 8500) {
            const p = between(
                unit.contact,
                unit.clash,
                (t - 6500) / 2000
            );

            const intensity = Math.sin(
                Math.PI *
                clamp(
                    (t - 6500) / 2000,
                    0,
                    1
                )
            );

            p.x += Math.sin(
                t / 170 + unit.seed
            ) * 5 * intensity;

            p.y += Math.cos(
                t / 200 + unit.seed
            ) * 4 * intensity;

            return p;
        }

        if (t < 11000) {
            const power = Math.sin(
                Math.PI *
                clamp(
                    (t - 8500) / 2500,
                    0,
                    1
                )
            );

            return {
                x: unit.clash.x +
                    Math.sin(
                        t / 175 + unit.seed
                    ) * 5 * power,

                y: unit.clash.y +
                    Math.cos(
                        t / 205 + unit.seed
                    ) * 4 * power
            };
        }

        if (t < 14000) {
            return between(
                unit.clash,
                unit.push,
                (t - 11000) / 3000
            );
        }

        if (t < 16500) {
            return between(
                unit.push,
                unit.gate,
                (t - 14000) / 2500
            );
        }

        if (t < 18500) {
            return between(
                unit.gate,
                unit.enter,
                (t - 16500) / 2000
            );
        }

        return between(
            unit.enter,
            unit.finish,
            (t - 18500) / 1500
        );
    }

    function updateArmies(t) {
        for (const unit of [...muslims, ...defenders]) {
            const p = positionOf(unit, t);

            const fighting =
                (t >= 6500 && t < 11000) ||
                (t >= 11000 && t < 14000);

            const scale = fighting
                ? 1 + Math.sin(
                    t / 135 + unit.seed
                ) * .05
                : 1;

            move(
                unit.node,
                p.x,
                p.y,
                scale
            );

            if (t >= 16500) {
                if (unit.green) {
                    const fade = ease(
                        (t - 17400 -
                            unit.row * 100 -
                            unit.col * 75) / 1900
                    );

                    unit.node.style.opacity = String(
                        1 - fade * .68
                    );
                } else {
                    const fade = ease(
                        (t - 16500) / 2300
                    );

                    unit.node.style.opacity = String(
                        1 - fade
                    );
                }
            } else {
                unit.node.style.opacity = "1";
            }
        }
    }

    function updateWallGuards(t) {
        for (const guard of wallGuards) {
            const shake =
                t >= 5000 && t < 14000
                    ? Math.sin(
                        t / 190 + guard.index
                    ) * 2
                    : 0;

            const retreat = ease(
                (t - 14000) / 2500
            );

            const x = guard.x + shake;
            const y = guard.y - retreat * 14;

            move(guard.node, x, y);

            guard.node.style.opacity = String(
                1 - retreat
            );
        }
    }

    function updateStandards(t) {
        const greenCarrier = muslims[14];
        const redCarrier = defenders[8];

        const green = positionOf(greenCarrier, t);
        const red = positionOf(redCarrier, t);

        move(
            muslimStandard,
            green.x,
            green.y
        );

        move(
            defenderStandard,
            red.x,
            red.y
        );

        muslimStandard.style.opacity =
            t >= 18500
                ? String(
                    1 - ease(
                        (t - 18500) / 1500
                    ) * .5
                )
                : "1";

        defenderStandard.style.opacity =
            t >= 14000
                ? String(
                    1 - ease(
                        (t - 14000) / 2500
                    )
                )
                : "1";
    }

    function updateArrows(t) {
        const active = t >= 5000 && t < 13800;

        for (const arrow of arrows) {
            if (!active) {
                arrow.node.style.opacity = "0";
                continue;
            }

            const i = arrow.index;

            const fromWall = i % 3 !== 0;

            const guard =
                wallGuards[(i * 3 + 1) % wallGuards.length];

            const muslim =
                muslims[(i * 5 + 2) % muslims.length];

            const muslimPos = positionOf(muslim, t);

            const source = fromWall
                ? {
                    x: guard.x,
                    y: guard.y
                }
                : {
                    x: muslimPos.x,
                    y: muslimPos.y
                };

            const target = fromWall
                ? {
                    x: muslimPos.x,
                    y: muslimPos.y
                }
                : {
                    x: guard.x,
                    y: guard.y
                };

            const shot =
                t - 5000 - i * 135;

            if (shot < 0) {
                arrow.node.style.opacity = "0";
                continue;
            }

            const cycle = (shot % 1180) / 1180;

            if (cycle > .74) {
                arrow.node.style.opacity = "0";
                continue;
            }

            const progress = cycle / .74;

            const x = mix(
                source.x,
                target.x,
                progress
            );

            const y =
                mix(
                    source.y,
                    target.y,
                    progress
                ) -
                Math.sin(
                    Math.PI * progress
                ) * 19;

            const angle = Math.atan2(
                target.y - source.y,
                target.x - source.x
            ) * 180 / Math.PI;

            arrow.node.style.opacity = String(
                Math.sin(
                    Math.PI * progress
                ) * .9
            );

            arrow.node.style.transform =
                `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg) scale(.85)`;
        }
    }

    function updateImpact(node, t, from, until, x, y) {
        if (t < from || t >= until) {
            node.style.opacity = "0";
            return;
        }

        const progress =
            ((t - from) % 850) / 850;

        node.style.opacity = String(
            (1 - progress) * .78
        );

        move(
            node,
            x,
            y,
            .45 + progress * 1.15
        );
    }

    function updateImpacts(t) {
        updateImpact(
            frontImpact,
            t,
            6500,
            11200,
            617,
            410
        );

        updateImpact(
            gateImpact,
            t,
            14000,
            16900,
            755,
            377
        );
    }

    function updateSparks(t) {
        const active =
            t >= 14000 && t < 16600;

        for (const spark of sparks) {
            if (!active) {
                spark.node.style.opacity = "0";
                continue;
            }

            const i = spark.index;

            const cycle =
                ((t - 14000 + i * 95) % 980) / 980;

            const radius =
                spark.radius * cycle;

            const x =
                755 +
                Math.cos(spark.angle) * radius;

            const y =
                367 +
                Math.sin(spark.angle) * radius * .7;

            spark.node.style.opacity = String(
                Math.sin(Math.PI * cycle)
            );

            move(
                spark.node,
                x,
                y,
                .6 + cycle * .5
            );
        }
    }

    function updateLabels(t) {
        muslimLabel.style.opacity =
            t < 5700 ? "1" : "0";

        defenderLabel.style.opacity =
            t < 5000 ? "1" : "0";
    }

    function updatePhase(t) {
        let index = 0;

        for (let i = 0; i < phases.length; i++) {
            if (t >= phases[i].time) {
                index = i;
            }
        }

        if (index === lastPhase) {
            return;
        }

        lastPhase = index;

        const phase = phases[index];

        field.dataset.scene = phase.scene;
        phaseText.textContent = phase.text;

        const title = storyCard.querySelector("span");
        const detail = storyCard.querySelector("strong");

        if (title) {
            title.textContent = phase.title;
        }

        if (detail) {
            detail.textContent = phase.detail;
        }
    }

    function updateBattle(t) {
        updateArmies(t);
        updateWallGuards(t);
        updateStandards(t);
        updateArrows(t);
        updateImpacts(t);
        updateSparks(t);
        updateLabels(t);
        updatePhase(t);

        sceneProgress.style.width =
            t / battleDuration * 100 + "%";
    }

    function updateLives() {
        livesDisplay.textContent =
            "❤️".repeat(lives) +
            "🖤".repeat(maxLives - lives);
    }

    function updateSoundButton() {
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
            elapsed >= musicStopTime
        ) {
            return;
        }

        gameMusic.volume = musicVolume;

        const attempt = gameMusic.play();

        if (attempt) {
            attempt.catch(() => {
                if (battleActive && musicEnabled) {
                    soundButton.textContent =
                        "🔇 Audio tidak tersedia";
                }
            });
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

        battleToken++;

        const currentToken = battleToken;

        elapsed = 0;
        lastPhase = -1;

        battleActive = true;
        quizActive = false;
        gameOver = false;
        rewardActive = false;

        if (lives <= 0) {
            lives = maxLives;
        }

        [
            startPanel,
            quizPanel,
            resultPanel,
            rewardPanel
        ].forEach(panel => {
            panel.classList.add("hidden");
        });

        battleHint.classList.remove("hidden");
        timerDisplay.textContent = "--";

        updateLives();
        updateBattle(0);
        playMusic();

        const startedAt = performance.now();

        function animate(now) {
            if (
                !battleActive ||
                currentToken !== battleToken
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
                elapsed >= musicStopTime &&
                !gameMusic.paused
            ) {
                stopMusic();
            }

            if (elapsed < battleDuration) {
                battleFrame =
                    requestAnimationFrame(animate);
            } else {
                battleFrame = null;
                battleActive = false;

                stopMusic();
                battleHint.classList.add("hidden");

                showQuiz();
            }
        }

        battleFrame =
            requestAnimationFrame(animate);
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

        const deadline =
            performance.now() + quizDuration;

        timerDisplay.textContent = "10s";
        questionTimer.textContent = "10 DETIK";
        timerProgress.style.width = "100%";

        function tick(now) {
            if (!quizActive) {
                return;
            }

            const remaining = Math.max(
                0,
                deadline - now
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
                    ? "#b6483c"
                    : "#c5a16a";

            if (remaining <= 0) {
                quizFrame = null;
                finishAnswer();
                loseLife("Waktu Habis!");
            } else {
                quizFrame =
                    requestAnimationFrame(tick);
            }
        }

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
        message,
        buttonText,
        action
    ) {
        quizPanel.classList.add("hidden");
        resultPanel.classList.remove("hidden");

        resultIcon.textContent = "✕";
        resultIcon.classList.add("wrong");

        resultTitle.textContent = title;
        resultText.textContent = message;
        resultButton.textContent = buttonText;
        resultButton.onclick = action;
    }

    function loseLife(title) {
        lives = Math.max(0, lives - 1);

        updateLives();

        if (lives === 0) {
            gameOver = true;

            showResult(
                "Game Over!",
                "Semua nyawa sudah habis.",
                "Ulangi Ekspedisi",
                () => {
                    lives = maxLives;
                    updateLives();
                    startBattle();
                }
            );
        } else {
            showResult(
                title,
                "Satu nyawa berkurang. Sisa nyawa: " + lives,
                "Coba Lagi",
                showQuiz
            );
        }
    }

    function readProgress() {
        const prefix = progressKey + "=";

        const saved = document.cookie
            .split(";")
            .map(item => item.trim())
            .find(item => item.startsWith(prefix));

        const value = saved
            ? Number.parseInt(
                saved.slice(prefix.length),
                10
            )
            : 1;

        return Number.isFinite(value)
            ? value
            : 1;
    }

    function unlockLevelFive() {
        const next = Math.max(
            readProgress(),
            5
        );

        document.cookie =
            `${progressKey}=${next}; Max-Age=31536000; Path=/; SameSite=Lax`;
    }

    function checkAnswer(answer) {
        if (!quizActive || gameOver) {
            return;
        }

        finishAnswer();

        if (answer === correctAnswer) {
            unlockLevelFive();
            showReward();
        } else {
            loseLife("Jawaban Salah!");
        }
    }

    function nextLevel() {
        battleToken++;

        battleActive = false;
        quizActive = false;
        rewardActive = false;

        stopFrames();
        stopMusic();
        rewardVideo.pause();

        window.location.href = "level5.html";
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

    async function playRewardVideo() {
        if (
            !rewardActive ||
            !videoReady ||
            videoAttempting ||
            rewardVideo.seeking ||
            rewardVideo.currentTime <
                videoStartTime - .25
        ) {
            return;
        }

        videoAttempting = true;
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
            videoAttempting = false;
        }
    }

    function tryAutoplayReward() {
        if (
            !rewardActive ||
            !videoReady ||
            videoAutoAttempted ||
            rewardVideo.seeking ||
            rewardVideo.currentTime <
                videoStartTime - .25
        ) {
            return;
        }

        videoAutoAttempted = true;
        playRewardVideo();
    }

    function prepareRewardVideo() {
        if (!rewardActive || videoReady) {
            return;
        }

        if (
            !Number.isFinite(rewardVideo.duration) ||
            rewardVideo.duration <= videoStartTime
        ) {
            showVideoFailure(
                "Video hadiah harus berdurasi lebih dari 10 detik."
            );
            return;
        }

        videoReady = true;

        try {
            rewardVideo.currentTime = videoStartTime;
        } catch (error) {
            videoReady = false;

            showVideoFailure(
                "Video tidak dapat dimulai dari detik ke-10."
            );
        }
    }

    function showReward() {
        gameOver = true;
        battleActive = false;
        rewardActive = true;

        videoReady = false;
        videoAutoAttempted = false;
        videoAttempting = false;

        stopFrames();
        stopMusic();

        quizPanel.classList.add("hidden");
        resultPanel.classList.add("hidden");
        rewardPanel.classList.remove("hidden");

        videoLoading.classList.remove("hidden");
        videoMessage.classList.add("hidden");
        manualPlayButton.classList.add("hidden");

        nextButton.textContent = "Next →";
        nextButton.classList.remove("hidden");

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

        updateSoundButton();

        if (musicEnabled) {
            playMusic();
        } else {
            gameMusic.pause();
        }
    });

    rewardVideo.addEventListener(
        "loadedmetadata",
        prepareRewardVideo
    );

    rewardVideo.addEventListener(
        "seeked",
        tryAutoplayReward
    );

    rewardVideo.addEventListener(
        "canplay",
        tryAutoplayReward
    );

    rewardVideo.addEventListener("ended", () => {
        if (!rewardActive) {
            return;
        }

        videoMessage.textContent =
            "Video hadiah selesai. Klik Next untuk melanjutkan.";

        videoMessage.classList.remove("hidden");
        nextButton.classList.remove("hidden");
    });

    rewardVideo.addEventListener("error", () => {
        if (rewardActive) {
            showVideoFailure(
                "Periksa file assets/reward-khaibar.mp4."
            );
        }
    });

    manualPlayButton.addEventListener(
        "click",
        playRewardVideo
    );

    nextButton.addEventListener(
        "click",
        nextLevel
    );

    window.addEventListener("pagehide", () => {
        battleToken++;

        battleActive = false;
        quizActive = false;
        rewardActive = false;

        stopFrames();
        stopMusic();
        rewardVideo.pause();
    });

    gameMusic.volume = musicVolume;
    gameMusic.loop = true;

    createArmy("muslim", 30);
    createArmy("defender", 18);

    createWallGuards();
    createArrows();
    createSparks();

    muslims[14].node.style.visibility = "hidden";
    defenders[8].node.style.visibility = "hidden";

    updateLives();
    updateSoundButton();
    updateBattle(0);
});


"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const get = id => document.getElementById(id);

    const field = get("battlefield");
    const defenderLayer = get("defenderLayer");
    const coalitionLayer = get("coalitionLayer");
    const scoutLayer = get("scoutLayer");
    const arrowLayer = get("arrowLayer");
    const windLayer = get("windLayer");

    const trenchGeometry = get("trenchGeometry");
    const trenchStrokes = [
        get("trenchOuter"),
        get("trenchBank"),
        get("trenchMiddle"),
        get("trenchFloor")
    ];

    const eventCard = get("eventCard");
    const salmanBadge = get("salmanBadge");
    const breachImpact = get("breachImpact");

    const livesDisplay = get("lives");
    const timerDisplay = get("timer");
    const phaseText = get("phaseText");
    const sceneProgress = get("sceneProgress");

    const startPanel = get("startPanel");
    const startButton = get("startButton");
    const quizPanel = get("quizPanel");
    const resultPanel = get("resultPanel");
    const rewardPanel = get("rewardPanel");
    const battleHint = get("battleHint");

    const questionTimer = get("questionTimer");
    const timerProgress = get("timerProgress");

    const resultIcon = get("resultIcon");
    const resultTitle = get("resultTitle");
    const resultText = get("resultText");
    const resultButton = get("resultButton");

    const answerButtons = [
        ...document.querySelectorAll(".answer")
    ];

    const gameMusic = get("gameMusic");
    const soundButton = get("soundButton");

    const rewardVideo = get("rewardVideo");
    const videoLoading = get("videoLoading");
    const videoMessage = get("videoMessage");
    const manualPlayButton = get("manualPlayButton");
    const nextButton = get("returnMapButton");

    const required = {
        field,
        defenderLayer,
        coalitionLayer,
        scoutLayer,
        arrowLayer,
        windLayer,
        trenchGeometry,
        eventCard,
        salmanBadge,
        breachImpact,
        livesDisplay,
        timerDisplay,
        phaseText,
        sceneProgress,
        startPanel,
        startButton,
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

    const missing = Object.entries(required)
        .filter(([, node]) => !node)
        .map(([name]) => name);

    if (
        missing.length ||
        trenchStrokes.some(node => !node)
    ) {
        console.error(
            "Elemen HTML Khandaq tidak lengkap:",
            missing.join(", ")
        );
        return;
    }

    const battleDuration = 20000;
    const quizDuration = 10000;
    const musicStopTime = 14000;
    const videoStartTime = 10;
    const musicVolume = 1;
    const maxLives = 3;
    const correctAnswer = "C";
    const progressKey = "islamStoryUnlockedLevel";

    const phases = [
        {
            time: 0,
            scene: "ready",
            text: "01 — PERSIAPAN PERTAHANAN KOTA",
            title: "PERSIAPAN",
            detail: "PASUKAN MENYIAPKAN PERTAHANAN"
        },
        {
            time: 1500,
            scene: "dig",
            text: "02 — USULAN SALMAN AL-FARISI DILAKSANAKAN",
            title: "STRATEGI PERTAHANAN",
            detail: "PARIT DIGALI DI JALUR MASUK KOTA"
        },
        {
            time: 4500,
            scene: "approach",
            text: "03 — PASUKAN GABUNGAN MENDEKATI KOTA",
            title: "PASUKAN PENYERANG DATANG",
            detail: "KEDUA PIHAK BERSIAP MENGHADAPI PENGEPUNGAN"
        },
        {
            time: 7600,
            scene: "siege",
            text: "04 — PARIT MENGHENTIKAN GERAK MAJU PENYERANG",
            title: "PENGEPUNGAN",
            detail: "PASUKAN GABUNGAN TERTAHAN DI TEPI PARIT"
        },
        {
            time: 9200,
            scene: "arrows",
            text: "05 — KEDUA PASUKAN SALING MELEPASKAN PANAH",
            title: "SERANGAN JARAK JAUH",
            detail: "PANAH DILEPASKAN DARI DUA SISI PARIT"
        },
        {
            time: 11100,
            scene: "breach",
            text: "06 — PENYERANG MENCOBA MENEROBOS PARIT",
            title: "UPAYA MENEROBOS",
            detail: "SEJUMLAH PENYERANG MENDEKATI SISI PERTAHANAN"
        },
        {
            time: 13000,
            scene: "defend",
            text: "07 — PASUKAN MUSLIM MENGHADANG PENYERANG",
            title: "PERTAHANAN BERTAHAN",
            detail: "UPAYA MENEROBOS BERHASIL DIHADANG"
        },
        {
            time: 15000,
            scene: "storm",
            text: "08 — ANGIN KENCANG MENGGUNCANG PERKEMAHAN",
            title: "ANGIN KENCANG",
            detail: "PERKEMAHAN PASUKAN GABUNGAN TERGUNCANG"
        },
        {
            time: 18000,
            scene: "retreat",
            text: "09 — PASUKAN GABUNGAN MULAI MUNDUR",
            title: "PENGEPUNGAN BERAKHIR",
            detail: "PASUKAN GABUNGAN MENINGGALKAN MEDAN"
        },
        {
            time: 19500,
            scene: "victory",
            text: "10 — KOTA BERHASIL DIPERTAHANKAN",
            title: "PERTAHANAN BERHASIL",
            detail: "PENGEPUNGAN TELAH BERAKHIR"
        }
    ];

    const defenders = [];
    const coalition = [];
    const scouts = [];
    const arrows = [];
    const winds = [];

    let greenFlag = null;
    let redFlag = null;

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

    let rewardReady = false;
    let rewardAutoAttempted = false;
    let rewardAttempting = false;

    const trenchLength =
        trenchGeometry.getTotalLength();

    function clamp(value, min, max) {
        return Math.max(
            min,
            Math.min(max, value)
        );
    }

    function mix(a, b, amount) {
        return a + (b - a) * amount;
    }

    function ease(value) {
        const t = clamp(value, 0, 1);
        return t * t * (3 - 2 * t);
    }

    function noise(seed) {
        const value =
            Math.sin(seed * 127.1 + 78.233) *
            43758.5453;

        return value - Math.floor(value);
    }

    function range(seed, a, b) {
        return mix(a, b, noise(seed));
    }

    function between(a, b, amount) {
        const t = ease(amount);

        return {
            x: mix(a.x, b.x, t),
            y: mix(a.y, b.y, t)
        };
    }

    function move(node, x, y, scale = 1) {
        node.style.transform =
            `translate3d(${x}px, ${y}px, 0) scale(${scale})`;
    }

    function createArmy(side, count) {
        const green = side === "green";
        const collection = green
            ? defenders
            : coalition;

        const parent = green
            ? defenderLayer
            : coalitionLayer;

        for (let i = 0; i < count; i++) {
            const col = i % 6;
            const row = Math.floor(i / 6);
            const seed = i + (green ? 41 : 141);

            const node = document.createElement("span");

            node.className =
                "khandaq-unit " +
                (green ? "green" : "red");

            node.setAttribute(
                "aria-hidden",
                "true"
            );

            parent.appendChild(node);

            const x = green
                ? 375 + col * 24
                : 360 + col * 24;

            const y = green
                ? 374 + row * 22
                : 160 + row * 18;

            collection.push({
                node,
                green,
                seed,
                col,
                row,
                start: {
                    x,
                    y
                },
                guard: {
                    x: green ? x + 8 : x,
                    y: green ? y - 7 : y + 11
                },
                retreat: {
                    x: green ? x + 10 : x + 22,
                    y: green ? y - 7 : y - 177
                }
            });
        }
    }

    function createFlag(side, unit) {
        const node = document.createElement("div");

        node.className =
            "khandaq-flag " + side;

        node.setAttribute(
            "aria-hidden",
            "true"
        );

        node.innerHTML = `
            <div class="khandaq-flag-pole"></div>
            <div class="khandaq-flag-cloth"></div>
            <div class="khandaq-flag-pawn"></div>
        `;

        field.appendChild(node);

        unit.node.style.visibility = "hidden";

        return {
            node,
            unit
        };
    }

    function createScouts() {
        for (let i = 0; i < 4; i++) {
            const node = document.createElement("span");

            node.className = "khandaq-scout";

            node.setAttribute(
                "aria-hidden",
                "true"
            );

            scoutLayer.appendChild(node);

            scouts.push({
                node,
                index: i,
                start: {
                    x: 435 + i * 24,
                    y: 250
                },
                crossing: {
                    x: 435 + i * 24,
                    y: 354 + (i % 2) * 5
                },
                returnPoint: {
                    x: 435 + i * 24,
                    y: 238
                }
            });
        }
    }

    function createArrows() {
        for (let i = 0; i < 12; i++) {
            const node = document.createElement("span");

            node.className = "khandaq-arrow";

            node.setAttribute(
                "aria-hidden",
                "true"
            );

            arrowLayer.appendChild(node);

            arrows.push({
                node,
                index: i
            });
        }
    }

    function createWinds() {
        for (let i = 0; i < 25; i++) {
            const node = document.createElement("span");

            node.className = "khandaq-wind-streak";

            node.style.width =
                range(i + 3, 45, 120) + "px";

            node.setAttribute(
                "aria-hidden",
                "true"
            );

            windLayer.appendChild(node);

            winds.push({
                node,
                index: i
            });
        }
    }

    function updateTrench(t) {
        const progress = ease(
            (t - 1500) / 3000
        );

        const offset =
            trenchLength * (1 - progress);

        trenchStrokes.forEach(node => {
            node.style.strokeDasharray =
                `${trenchLength} ${trenchLength}`;

            node.style.strokeDashoffset =
                String(offset);
        });
    }

    function armyPosition(unit, t) {
        if (t < 4500) {
            return unit.start;
        }

        if (t < 7600) {
            return between(
                unit.start,
                unit.guard,
                (t - 4500) / 3100
            );
        }

        if (t < 15000) {
            const p = {
                x: unit.guard.x,
                y: unit.guard.y
            };

            if (t >= 11100 && t < 14500) {
                const intensity = Math.sin(
                    Math.PI *
                    clamp(
                        (t - 11100) / 3400,
                        0,
                        1
                    )
                );

                if (unit.green && unit.row === 0) {
                    p.y -= Math.sin(
                        t / 190 + unit.seed
                    ) * 3 * intensity;
                }

                if (!unit.green && unit.row >= 4) {
                    p.x += Math.sin(
                        t / 210 + unit.seed
                    ) * 3 * intensity;
                }
            }

            return p;
        }

        if (t < 18000) {
            const p = {
                x: unit.guard.x,
                y: unit.guard.y
            };

            if (!unit.green) {
                p.x += Math.sin(
                    t / 160 + unit.seed
                ) * 5;

                p.y += Math.cos(
                    t / 200 + unit.seed
                ) * 3;
            }

            return p;
        }

        return between(
            unit.guard,
            unit.retreat,
            (t - 18000) / 2000
        );
    }

    function updateArmies(t) {
        for (const unit of [
            ...defenders,
            ...coalition
        ]) {
            const p = armyPosition(unit, t);

            move(
                unit.node,
                p.x,
                p.y
            );
        }
    }

    function updateFlags(t) {
        for (const flag of [
            greenFlag,
            redFlag
        ]) {
            if (!flag) {
                continue;
            }

            const p = armyPosition(
                flag.unit,
                t
            );

            move(
                flag.node,
                p.x,
                p.y
            );
        }
    }

    function scoutPosition(scout, t) {
        if (t < 11100) {
            return scout.start;
        }

        const delay =
            scout.index * 110;

        const start = 11100 + delay;

        if (t < start) {
            return scout.start;
        }

        if (t < 12800 + delay) {
            return between(
                scout.start,
                scout.crossing,
                (t - start) / 1700
            );
        }

        return between(
            scout.crossing,
            scout.returnPoint,
            (t - 12800 - delay) / 1700
        );
    }

    function updateScouts(t) {
        for (const scout of scouts) {
            if (
                t < 11100 + scout.index * 110 ||
                t >= 14700
            ) {
                scout.node.style.opacity = "0";
                continue;
            }

            const p = scoutPosition(
                scout,
                t
            );

            move(
                scout.node,
                p.x,
                p.y,
                1 + Math.sin(
                    t / 170 + scout.index
                ) * .05
            );

            scout.node.style.opacity = "1";
        }
    }

    function updateArrows(t) {
        const active =
            t >= 9200 && t < 13600;

        for (const arrow of arrows) {
            if (!active) {
                arrow.node.style.opacity = "0";
                continue;
            }

            const i = arrow.index;
            const fromGreen = i % 2 === 0;

            const green =
                defenders[i % 6];

            const red =
                coalition[30 + i % 6];

            const source = armyPosition(
                fromGreen ? green : red,
                t
            );

            const target = armyPosition(
                fromGreen ? red : green,
                t
            );

            const shot =
                t - 9200 - i * 135;

            if (shot < 0) {
                arrow.node.style.opacity = "0";
                continue;
            }

            const cycle =
                (shot % 1400) / 1400;

            if (cycle > .72) {
                arrow.node.style.opacity = "0";
                continue;
            }

            const progress = cycle / .72;

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
                ) * 14;

            const angle =
                Math.atan2(
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

    function updateImpact(t) {
        const active =
            t >= 11900 && t < 14300;

        if (!active) {
            breachImpact.style.opacity = "0";
            return;
        }

        const progress =
            ((t - 11900) % 820) / 820;

        const waveX =
            477 + Math.sin(t / 250) * 13;

        const waveY =
            349 + Math.cos(t / 320) * 5;

        breachImpact.style.opacity = String(
            (1 - progress) * .75
        );

        move(
            breachImpact,
            waveX,
            waveY,
            .35 + progress * 1.1
        );
    }

    function updateWind(t) {
        const active =
            t >= 15000 && t < 19500;

        for (const wind of winds) {
            if (!active) {
                wind.node.style.opacity = "0";
                continue;
            }

            const i = wind.index;

            const cycle =
                (
                    (t - 15000 + i * 123) %
                    1050
                ) / 1050;

            const x =
                1030 - cycle * 1170;

            const y =
                90 +
                (i * 23) % 166 +
                Math.sin(
                    t / 370 + i
                ) * 10;

            wind.node.style.opacity = String(
                Math.sin(
                    Math.PI * cycle
                ) * .87
            );

            wind.node.style.transform =
                `translate3d(${x}px, ${y}px, 0) rotate(-8deg)`;
        }
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

        field.dataset.scene =
            phase.scene;

        phaseText.textContent =
            phase.text;

        const title =
            eventCard.querySelector("span");

        const detail =
            eventCard.querySelector("strong");

        if (title) {
            title.textContent =
                phase.title;
        }

        if (detail) {
            detail.textContent =
                phase.detail;
        }

        if (phase.scene === "dig") {
            salmanBadge.style.opacity = "1";
        } else if (
            phase.scene === "storm" ||
            phase.scene === "retreat"
        ) {
            salmanBadge.style.opacity = ".7";
        } else {
            salmanBadge.style.opacity = "1";
        }
    }

    function updateBattle(t) {
        updateTrench(t);
        updateArmies(t);
        updateFlags(t);
        updateScouts(t);
        updateArrows(t);
        updateImpact(t);
        updateWind(t);
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

        gameMusic.volume =
            musicVolume;

        const attempt = gameMusic.play();

        if (attempt) {
            attempt.catch(() => {
                if (
                    battleActive &&
                    musicEnabled
                ) {
                    soundButton.textContent =
                        "🔇 Audio tidak tersedia";
                }
            });
        }
    }

    function stopFrames() {
        if (battleFrame !== null) {
            cancelAnimationFrame(
                battleFrame
            );
        }

        if (quizFrame !== null) {
            cancelAnimationFrame(
                quizFrame
            );
        }

        battleFrame = null;
        quizFrame = null;
    }

    function startBattle() {
        stopFrames();
        stopMusic();
        rewardVideo.pause();

        battleToken++;

        const currentToken =
            battleToken;

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

        const startedAt =
            performance.now();

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
                    requestAnimationFrame(
                        animate
                    );
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
            cancelAnimationFrame(
                quizFrame
            );
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
                Math.ceil(
                    remaining / 1000
                );

            timerDisplay.textContent =
                seconds + "s";

            questionTimer.textContent =
                seconds + " DETIK";

            timerProgress.style.width =
                remaining /
                quizDuration * 100 + "%";

            timerProgress.style.background =
                remaining <= 3000
                    ? "#b94338"
                    : "#bd995e";

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
            cancelAnimationFrame(
                quizFrame
            );
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

        resultTitle.textContent =
            title;

        resultText.textContent =
            message;

        resultButton.textContent =
            buttonText;

        resultButton.onclick =
            action;
    }

    function loseLife(title) {
        lives = Math.max(
            0,
            lives - 1
        );

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
        const prefix =
            progressKey + "=";

        const savedCookie = document.cookie
            .split(";")
            .map(item => item.trim())
            .find(
                item => item.startsWith(prefix)
            );

        const value = savedCookie
            ? Number.parseInt(
                savedCookie.slice(
                    prefix.length
                ),
                10
            )
            : 1;

        return Number.isFinite(value)
            ? value
            : 1;
    }

    function unlockLevelFour() {
        const next = Math.max(
            readProgress(),
            4
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
            unlockLevelFour();
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

        window.location.href =
            "level4.html";
    }

    function showVideoFailure(message) {
        if (!rewardActive) {
            return;
        }

        videoLoading.classList.add("hidden");

        videoMessage.textContent =
            message;

        videoMessage.classList.remove("hidden");

        manualPlayButton.classList.add("hidden");

        nextButton.classList.remove("hidden");
    }

    async function playRewardVideo() {
        if (
            !rewardActive ||
            !rewardReady ||
            rewardAttempting ||
            rewardVideo.seeking ||
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
            if (!rewardActive) {
                return;
            }

            videoLoading.classList.add("hidden");

            videoMessage.textContent =
                "Browser memblokir pemutaran otomatis bersuara. Tekan Putar Video.";

            videoMessage.classList.remove("hidden");

            manualPlayButton.classList.remove("hidden");
        } finally {
            rewardAttempting = false;
        }
    }

    function tryAutoplayReward() {
        if (
            !rewardActive ||
            !rewardReady ||
            rewardAutoAttempted ||
            rewardVideo.seeking ||
            rewardVideo.currentTime <
                videoStartTime - .25
        ) {
            return;
        }

        rewardAutoAttempted = true;

        playRewardVideo();
    }

    function prepareRewardVideo() {
        if (!rewardActive || rewardReady) {
            return;
        }

        if (
            !Number.isFinite(
                rewardVideo.duration
            ) ||
            rewardVideo.duration <=
                videoStartTime
        ) {
            showVideoFailure(
                "Video hadiah harus lebih panjang dari 10 detik."
            );
            return;
        }

        rewardReady = true;

        try {
            rewardVideo.currentTime =
                videoStartTime;
        } catch (error) {
            rewardReady = false;

            showVideoFailure(
                "Video tidak dapat dimulai dari detik ke-10."
            );
        }
    }

    function showReward() {
        gameOver = true;
        battleActive = false;
        rewardActive = true;

        rewardReady = false;
        rewardAutoAttempted = false;
        rewardAttempting = false;

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
            checkAnswer(
                button.dataset.answer
            );
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

    rewardVideo.addEventListener(
        "ended",
        nextLevel
    );

    rewardVideo.addEventListener("error", () => {
        if (rewardActive) {
            showVideoFailure(
                "Periksa file assets/reward-khandaq.mp4."
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

    gameMusic.volume =
        musicVolume;

    gameMusic.loop = true;

    createArmy("green", 30);
    createArmy("red", 36);

    greenFlag = createFlag(
        "green",
        defenders[15]
    );

    redFlag = createFlag(
        "red",
        coalition[15]
    );

    createScouts();
    createArrows();
    createWinds();

    updateLives();
    updateSoundButton();
    updateBattle(0);
});

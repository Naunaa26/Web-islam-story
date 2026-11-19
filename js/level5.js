
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const get = id => document.getElementById(id);

    const field = get("battlefield");

    const muslimLayer = get("muslimLayer");
    const enemyLayer = get("enemyLayer");
    const effectsLayer = get("effectsLayer");

    const muslimLabel = get("muslimLabel");
    const enemyLabel = get("enemyLabel");

    const standardBearer = get("standardBearer");
    const enemyStandard = get("enemyStandard");
    const leaderName = get("leaderName");

    const commandItems = [
        get("commandZaid"),
        get("commandJafar"),
        get("commandRawaha"),
        get("commandKhalid")
    ];

    const handoverGlow = get("handoverGlow");
    const handoverNotice = get("handoverNotice");
    const noticeTitle = get("noticeTitle");
    const noticeText = get("noticeText");

    const frontImpact = get("frontImpact");
    const storyCard = get("storyCard");

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
        enemyLayer,
        effectsLayer,
        muslimLabel,
        enemyLabel,
        standardBearer,
        enemyStandard,
        leaderName,
        handoverGlow,
        handoverNotice,
        noticeTitle,
        noticeText,
        frontImpact,
        storyCard,
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
        .filter(([, node]) => !node)
        .map(([name]) => name);

    if (
        missing.length ||
        commandItems.some(node => !node)
    ) {
        console.error(
            "Elemen Level 5 tidak ditemukan:",
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
            text: "01 — PASUKAN BERSIAP DI LEMBAH BERBATU",
            title: "PERSIAPAN PASUKAN",
            detail: "DUA PASUKAN BERSIAP DI MEDAN TERBUKA",
            leader: "ZAID BIN HARITSAH",
            leaderId: "zaid",
            command: 0
        },
        {
            time: 2000,
            scene: "advance",
            text: "02 — DUA PASUKAN BERGERAK MAJU",
            title: "PERGERAKAN PASUKAN",
            detail: "KEDUA BARISAN MENDEKATI GARIS DEPAN",
            leader: "ZAID BIN HARITSAH",
            leaderId: "zaid",
            command: 0
        },
        {
            time: 5000,
            scene: "contact",
            text: "03 — PASUKAN MEMASUKI JARAK DEKAT",
            title: "KONTAK PERTAMA",
            detail: "KEDUA PASUKAN SEMAKIN MENDEKAT",
            leader: "ZAID BIN HARITSAH",
            leaderId: "zaid",
            command: 0
        },
        {
            time: 6100,
            scene: "clash",
            text: "04 — BENTROKAN DIMULAI DI LEMBAH",
            title: "PERTEMPURAN BERLANGSUNG",
            detail: "KEDUA PASUKAN BERTEMU DI GARIS DEPAN",
            leader: "ZAID BIN HARITSAH",
            leaderId: "zaid",
            command: 0
        },
        {
            time: 7400,
            scene: "jafar",
            text: "05 — ZAID GUGUR, JA'FAR MENGAMBIL PANJI",
            title: "PERGANTIAN PANJI PERTAMA",
            detail: "JA'FAR BIN ABI THALIB MELANJUTKAN KOMANDO",
            leader: "JA'FAR BIN ABI THALIB",
            leaderId: "jafar",
            command: 1,
            noticeTitle: "PANJI BERP INDAH KE JA'FAR",
            noticeText: "Ja'far bin Abi Thalib melanjutkan kepemimpinan."
        },
        {
            time: 9400,
            scene: "rawaha",
            text: "06 — JA'FAR GUGUR, ABDULLAH MEMIMPIN",
            title: "PERGANTIAN PANJI KEDUA",
            detail: "ABDULLAH BIN RAWAHA MELANJUTKAN PERTEMPURAN",
            leader: "ABDULLAH BIN RAWAHA",
            leaderId: "rawaha",
            command: 2,
            noticeTitle: "PANJI DIPEGANG ABDULLAH",
            noticeText: "Abdullah bin Rawaha melanjutkan perjuangan."
        },
        {
            time: 11400,
            scene: "thabit",
            text: "07 — ABDULLAH GUGUR, TSABIT MENGANGKAT PANJI",
            title: "PANJI DIANGKAT KEMBALI",
            detail: "TSABIT BIN ARQAM MENJAGA PANJI PASUKAN",
            leader: "TSABIT BIN ARQAM",
            leaderId: "thabit",
            command: 3,
            noticeTitle: "PANJI KEMBALI TERANGKAT",
            noticeText: "Tsabit bin Arqam mengangkat panji pasukan."
        },
        {
            time: 13400,
            scene: "khalid",
            text: "08 — KHALID BIN WALID MENGAMBIL KOMANDO",
            title: "PEMIMPIN BARU",
            detail: "KHALID BIN WALID MEMIMPIN PASUKAN",
            leader: "KHALID BIN WALID",
            leaderId: "khalid",
            command: 3,
            noticeTitle: "KHALID BIN WALID MEMIMPIN",
            noticeText: "Khalid mengambil alih komando pasukan."
        },
        {
            time: 15500,
            scene: "reform",
            text: "09 — PASUKAN MENATA ULANG FORMASI",
            title: "STRATEGI PERTAHANAN",
            detail: "KHALID MENGATUR BARISAN MENGHADAPI LAWAN",
            leader: "KHALID BIN WALID",
            leaderId: "khalid",
            command: 3
        },
        {
            time: 16600,
            scene: "counter",
            text: "10 — BARISAN BARU MENAHAN TEKANAN",
            title: "PERTAHANAN TERATUR",
            detail: "BARISAN MUSLIM BERTAHAN DALAM FORMASI",
            leader: "KHALID BIN WALID",
            leaderId: "khalid",
            command: 3
        },
        {
            time: 18000,
            scene: "withdraw",
            text: "11 — KHALID MEMIMPIN PENARIKAN PASUKAN",
            title: "PENARIKAN TERATUR",
            detail: "PASUKAN MUNDUR BERSAMA DENGAN TERKENDALI",
            leader: "KHALID BIN WALID",
            leaderId: "khalid",
            command: 3
        }
    ];

    const muslims = [];
    const enemies = [];
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
    let videoAttempting = false;
    let videoAutoAttempted = false;

    const clamp = (value, min, max) =>
        Math.max(min, Math.min(max, value));

    const mix = (a, b, amount) =>
        a + (b - a) * amount;

    function ease(value) {
        const t = clamp(value, 0, 1);
        return t * t * (3 - 2 * t);
    }

    function noise(seed) {
        const value =
            Math.sin(seed * 127.1 + 78.233) *
            43758.5453123;

        return value - Math.floor(value);
    }

    function range(seed, min, max) {
        return mix(min, max, noise(seed));
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
        const green = side === "muslim";
        const group = green ? muslims : enemies;
        const layer = green ? muslimLayer : enemyLayer;

        for (let i = 0; i < count; i++) {
            const col = i % 6;
            const row = Math.floor(i / 6);
            const seed = i + (green ? 31 : 131);

            const node = document.createElement("span");

            node.className =
                "mutah-unit " +
                (green ? "muslim" : "enemy");

            node.setAttribute("aria-hidden", "true");

            layer.appendChild(node);

            const y = 333 + row * 27;

            group.push({
                node,
                green,
                seed,
                col,
                row,

                start: {
                    x: green
                        ? 132 + col * 23
                        : 868 - col * 23,
                    y
                },

                march: {
                    x: green
                        ? 300 + col * 22
                        : 700 - col * 22,
                    y
                },

                contact: {
                    x: green
                        ? 385 + col * 21
                        : 610 - col * 21,
                    y
                },

                pressure: {
                    x: green
                        ? 376 + col * 22
                        : 602 - col * 22,
                    y
                },

                regroup: {
                    x: green
                        ? 344 + col * 22
                        : 634 - col * 22,
                    y
                },

                shield: {
                    x: green
                        ? 400 + col * 20
                        : 612 - col * 20,
                    y
                },

                exit: {
                    x: green
                        ? 68 + col * 22
                        : 680 - col * 22,
                    y
                }
            });
        }
    }

    function createSparks() {
        for (let i = 0; i < 18; i++) {
            const node = document.createElement("span");

            node.className = "mutah-spark";
            node.setAttribute("aria-hidden", "true");

            effectsLayer.appendChild(node);

            sparks.push({
                node,
                index: i,
                angle: range(i + 21, 0, Math.PI * 2),
                distance: range(i + 53, 8, 28)
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

        if (t < 7000) {
            const p = between(
                unit.march,
                unit.contact,
                (t - 5000) / 2000
            );

            if (t >= 6100) {
                const power = ease(
                    (t - 6100) / 900
                );

                p.x += Math.sin(
                    t / 160 + unit.seed
                ) * 4 * power;
            }

            return p;
        }

        if (t < 13400) {
            const p = between(
                unit.contact,
                unit.pressure,
                (t - 7000) / 6400
            );

            const rowWeight = unit.row % 2 === 0
                ? 1
                : .75;

            p.x += Math.sin(
                t / 175 + unit.seed
            ) * 5 * rowWeight;

            p.y += Math.cos(
                t / 205 + unit.seed
            ) * 4 * rowWeight;

            return p;
        }

        if (t < 15500) {
            return between(
                unit.pressure,
                unit.regroup,
                (t - 13400) / 2100
            );
        }

        if (t < 18000) {
            const p = between(
                unit.regroup,
                unit.shield,
                (t - 15500) / 2500
            );

            if (t >= 16600) {
                const intensity = Math.sin(
                    Math.PI *
                    clamp(
                        (t - 16600) / 1400,
                        0,
                        1
                    )
                );

                p.x += Math.sin(
                    t / 170 + unit.seed
                ) * 4 * intensity;

                p.y += Math.cos(
                    t / 190 + unit.seed
                ) * 3 * intensity;
            }

            return p;
        }

        return between(
            unit.shield,
            unit.exit,
            (t - 18000) / 2000
        );
    }

    function updateArmies(t) {
        for (const unit of [
            ...muslims,
            ...enemies
        ]) {
            const p = positionOf(unit, t);

            const fighting =
                (t >= 6100 && t < 13400) ||
                (t >= 16600 && t < 18000);

            const scale = fighting
                ? 1 + Math.sin(
                    t / 130 + unit.seed
                ) * .045
                : 1;

            move(
                unit.node,
                p.x,
                p.y,
                scale
            );
        }
    }

    function getCarrierIndex(t) {
        if (t < 7400) {
            return 0;
        }

        if (t < 9400) {
            return 1;
        }

        if (t < 11400) {
            return 2;
        }

        if (t < 13400) {
            return 3;
        }

        return 4;
    }

    const carrierIndexes = [
        17,
        11,
        23,
        14,
        8
    ];

    const changeTimes = [
        7400,
        9400,
        11400,
        13400
    ];

    function getStandardPosition(t) {
        const index = getCarrierIndex(t);

        const currentUnit =
            muslims[carrierIndexes[index]];

        const currentPosition =
            positionOf(currentUnit, t);

        if (index === 0) {
            return currentPosition;
        }

        const changeTime =
            changeTimes[index - 1];

        if (t >= changeTime + 550) {
            return currentPosition;
        }

        const previousUnit =
            muslims[carrierIndexes[index - 1]];

        const previousPosition =
            positionOf(previousUnit, t);

        return between(
            previousPosition,
            currentPosition,
            (t - changeTime) / 550
        );
    }

    function updateStandards(t) {
        const carrierIndex =
            getCarrierIndex(t);

        const greenCarrier =
            muslims[carrierIndexes[carrierIndex]];

        const redCarrier =
            enemies[14];

        for (const unit of muslims) {
            unit.node.style.visibility = "visible";
        }

        greenCarrier.node.style.visibility = "hidden";
        redCarrier.node.style.visibility = "hidden";

        const greenPosition =
            getStandardPosition(t);

        const redPosition =
            positionOf(redCarrier, t);

        move(
            standardBearer,
            greenPosition.x,
            greenPosition.y
        );

        move(
            enemyStandard,
            redPosition.x,
            redPosition.y
        );

        const recent = changeTimes.find(
            time =>
                t >= time &&
                t < time + 550
        );

        if (recent === undefined) {
            handoverGlow.style.opacity = "0";
            return;
        }

        const progress =
            (t - recent) / 550;

        handoverGlow.style.opacity = String(
            1 - progress
        );

        move(
            handoverGlow,
            greenPosition.x,
            greenPosition.y - 26,
            .55 + progress * 1.5
        );
    }

    function getFrontPair(t, row) {
        const greenUnit =
            muslims[row * 6 + 5];

        const redUnit =
            enemies[row * 6 + 5];

        const green =
            positionOf(greenUnit, t);

        const red =
            positionOf(redUnit, t);

        return {
            x: (green.x + red.x) / 2,
            y: (green.y + red.y) / 2,
            distance: Math.hypot(
                red.x - green.x,
                red.y - green.y
            )
        };
    }

    function updateCombat(t) {
        const active =
            (t >= 6100 && t < 13400) ||
            (t >= 16600 && t < 18000);

        if (!active) {
            frontImpact.style.opacity = "0";

            sparks.forEach(spark => {
                spark.node.style.opacity = "0";
            });

            return;
        }

        const centralPair =
            getFrontPair(t, 2);

        if (centralPair.distance > 90) {
            frontImpact.style.opacity = "0";
        } else {
            const cycle =
                (t % 850) / 850;

            frontImpact.style.opacity = String(
                (1 - cycle) * .65
            );

            move(
                frontImpact,
                centralPair.x,
                centralPair.y,
                .45 + cycle * 1.1
            );
        }

        for (const spark of sparks) {
            const i = spark.index;
            const row = i % 5;

            const pair =
                getFrontPair(t, row);

            if (pair.distance > 90) {
                spark.node.style.opacity = "0";
                continue;
            }

            const cycle =
                ((t + i * 137) % 1000) / 1000;

            const distance =
                spark.distance * cycle;

            const x =
                pair.x +
                Math.cos(spark.angle) * distance;

            const y =
                pair.y +
                Math.sin(spark.angle) *
                distance * .65;

            spark.node.style.opacity = String(
                Math.sin(Math.PI * cycle) * .85
            );

            move(
                spark.node,
                x,
                y,
                .7 + cycle * .4
            );
        }
    }

    function updateLabels(t) {
        const green =
            positionOf(muslims[2], t);

        const red =
            positionOf(enemies[2], t);

        muslimLabel.style.left =
            green.x + "px";

        enemyLabel.style.left =
            red.x + "px";

        const visible =
            t < 4800;

        muslimLabel.style.opacity =
            visible ? "1" : "0";

        enemyLabel.style.opacity =
            visible ? "1" : "0";
    }

    function updateCommands(index) {
        let activeCommand =
            phases[index].command;

        for (let i = 0; i < commandItems.length; i++) {
            const node = commandItems[i];

            const passed =
                i < activeCommand;

            const active =
                i === activeCommand;

            node.classList.toggle(
                "passed",
                passed
            );

            node.classList.toggle(
                "active",
                active
            );
        }

        if (phases[index].leaderId === "thabit") {
            commandItems[2].classList.add("passed");
            commandItems[2].classList.remove("active");

            commandItems[3].classList.remove("active");
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
            storyCard.querySelector("span");

        const detail =
            storyCard.querySelector("strong");

        if (title) {
            title.textContent =
                phase.title;
        }

        if (detail) {
            detail.textContent =
                phase.detail;
        }

        leaderName.textContent =
            phase.leader;

        standardBearer.dataset.leader =
            phase.leaderId;

        if (phase.noticeTitle) {
            noticeTitle.textContent =
                phase.noticeTitle;

            noticeText.textContent =
                phase.noticeText;
        }

        updateCommands(index);
    }

    function updateBattle(t) {
        updateArmies(t);
        updateStandards(t);
        updateCombat(t);
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
                if (battleActive) {
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

        const token = battleToken;

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

        const startTime = performance.now();

        function animate(now) {
            if (
                !battleActive ||
                token !== battleToken
            ) {
                return;
            }

            elapsed = clamp(
                now - startTime,
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
                battleActive = false;
                battleFrame = null;

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
                    ? "#bb493e"
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

    function saveProgress() {
        const next = Math.max(
            readProgress(),
            6
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
            saveProgress();
            showReward();
        } else {
            loseLife("Jawaban Salah!");
        }
    }

    function returnToMap() {
        battleToken++;

        battleActive = false;
        quizActive = false;
        rewardActive = false;

        stopFrames();
        stopMusic();

        rewardVideo.pause();

        window.location.href = "adventure.html";
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
                nextButton.classList.remove("hidden");
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
        videoAttempting = false;
        videoAutoAttempted = false;

        stopFrames();
        stopMusic();

        quizPanel.classList.add("hidden");
        resultPanel.classList.add("hidden");
        rewardPanel.classList.remove("hidden");

        videoLoading.classList.remove("hidden");
        videoMessage.classList.add("hidden");
        manualPlayButton.classList.add("hidden");
        nextButton.classList.add("hidden");

        nextButton.textContent = "Kembali ke Peta →";

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

        videoLoading.classList.add("hidden");

        videoMessage.textContent =
            "Lima ekspedisi selesai. Progres kamu sudah 50%!";

        videoMessage.classList.remove("hidden");
        nextButton.classList.remove("hidden");
    });

    rewardVideo.addEventListener("error", () => {
        if (rewardActive) {
            showVideoFailure(
                "Periksa file assets/reward-mutah.mp4."
            );
        }
    });

    manualPlayButton.addEventListener(
        "click",
        playRewardVideo
    );

    nextButton.addEventListener(
        "click",
        returnToMap
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
    createArmy("enemy", 36);
    createSparks();

    updateLives();
    updateSoundButton();
    updateBattle(0);
});

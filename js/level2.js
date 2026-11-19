
"use strict";

document.addEventListener("DOMContentLoaded", () => {
    const get = id => document.getElementById(id);

    const field = get("battlefield");
    const unitsLayer = get("unitsLayer");
    const archersLayer = get("archersLayer");
    const cavalryLayer = get("cavalryLayer");
    const arrowLayer = get("arrowLayer");

    const cavalryRoute = get("cavalryRoute");
    const cavalryBadge = get("cavalryBadge");

    const muslimLabel = get("muslimLabel");
    const qurayshLabel = get("qurayshLabel");

    const archerStatus = get("archerStatus");
    const storyCard = get("storyCard");
    const attackAlert = get("attackAlert");

    const frontImpact = get("frontImpact");
    const rearImpact = get("rearImpact");

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
        unitsLayer,
        archersLayer,
        cavalryLayer,
        arrowLayer,
        cavalryRoute,
        cavalryBadge,
        muslimLabel,
        qurayshLabel,
        archerStatus,
        storyCard,
        attackAlert,
        frontImpact,
        rearImpact,
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
        .filter(([, value]) => !value)
        .map(([name]) => name);

    if (missing.length) {
        console.error(
            "Elemen HTML Uhud tidak ditemukan:",
            missing.join(", ")
        );
        return;
    }

    const battleDuration = 20000;
    const quizDuration = 10000;
    const musicStopTime = 17000;
    const videoStartTime = 15;
    const musicVolume = 0.95;
    const correctAnswer = "B";
    const maxLives = 3;
    const progressKey = "islamStoryUnlockedLevel";

    const phases = [
        {
            time: 0,
            scene: "ready",
            text: "01 — PASUKAN BERSIAP, PEMANAH MENJAGA BUKIT",
            title: "PERSIAPAN PERTAHANAN",
            detail: "PEMANAH MENEMPATI POSISI DI BUKIT"
        },
        {
            time: 2200,
            scene: "advance",
            text: "02 — DUA PASUKAN MULAI BERGERAK MAJU",
            title: "PERGERAKAN PASUKAN",
            detail: "KEDUA BARISAN MAJU DALAM FORMASI"
        },
        {
            time: 5700,
            scene: "contact",
            text: "03 — BARISAN DEPAN MULAI BERTEMU",
            title: "KONTAK PERTAMA",
            detail: "KEDUA PASUKAN BERTEMU DI GARIS DEPAN"
        },
        {
            time: 6800,
            scene: "clash",
            text: "04 — BENTROKAN DAN SERANGAN PEMANAH",
            title: "PERTEMPURAN BERLANGSUNG",
            detail: "PEMANAH MEMBANTU DARI POSISI DI BUKIT"
        },
        {
            time: 8700,
            scene: "retreat",
            text: "05 — PASUKAN QURAISY TERDESAK DAN MUNDUR",
            title: "KEADAAN BERUBAH",
            detail: "PASUKAN QURAISY MULAI MENINGGALKAN GARIS DEPAN"
        },
        {
            time: 10200,
            scene: "archers",
            text: "06 — SEBAGIAN PEMANAH MENINGGALKAN BUKIT",
            title: "POSISI PEMANAH BERKURANG",
            detail: "SEBAGIAN PEMANAH TURUN DARI BUKIT"
        },
        {
            time: 11800,
            scene: "flank",
            text: "07 — KAVALERI QURAISY BERGERAK MEMUTAR",
            title: "GERAKAN KAVALERI",
            detail: "PASUKAN BERKUDA MENCARI CELAH DARI SISI LAIN"
        },
        {
            time: 15200,
            scene: "rear-attack",
            text: "08 — KAVALERI MENYERANG DARI BELAKANG",
            title: "SERANGAN BALIK",
            detail: "KAVALERI MENCAPAI BELAKANG PASUKAN MUSLIM"
        },
        {
            time: 17000,
            scene: "two-fronts",
            text: "09 — QURAISY KEMBALI MAJU, BENTROKAN DUA ARAH",
            title: "PERTEMPURAN DUA ARAH",
            detail: "PASUKAN MUSLIM MENGHADAPI TEKANAN DARI DUA SISI"
        },
        {
            time: 18900,
            scene: "defense",
            text: "10 — PASUKAN MUSLIM BERTAHAN DAN BERKUMPUL",
            title: "PERTAHANAN TERAKHIR",
            detail: "PASUKAN BERUSAHA MEMPERTAHANKAN POSISI"
        }
    ];

    const soldiers = [];
    const archers = [];
    const riders = [];
    const arrows = [];

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

    const routeLength = cavalryRoute.getTotalLength();

    const greenFlag = muslimLabel.querySelector(
        ".uhud-banner"
    );

    const redFlag = qurayshLabel.querySelector(
        ".uhud-banner"
    );

    if (greenFlag) {
        field.appendChild(greenFlag);
    }

    if (redFlag) {
        field.appendChild(redFlag);
    }

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
            43758.5453123;

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
        const green = side === "muslim";

        for (let i = 0; i < count; i++) {
            const col = i % 6;
            const row = Math.floor(i / 6);
            const seed = i + (green ? 43 : 143);

            const node = document.createElement("span");

            node.className =
                "uhud-pawn " +
                (green ? "muslim" : "quraysh");

            node.setAttribute(
                "aria-hidden",
                "true"
            );

            unitsLayer.appendChild(node);

            const startX = green
                ? 180 + col * 23
                : 820 - col * 23;

            const startY =
                337 + row * 25;

            soldiers.push({
                node,
                green,
                seed,
                col,
                row,

                start: {
                    x: startX,
                    y: startY
                },

                march: {
                    x: green
                        ? 335 + col * 23
                        : 665 - col * 23,
                    y: startY
                },

                contact: {
                    x: green
                        ? 405 + col * 22
                        : 595 - col * 22,
                    y: startY
                },

                clash: {
                    x: green
                        ? 447 + col * 18
                        : 553 - col * 18,
                    y: startY +
                        range(seed, -6, 6)
                },

                push: {
                    x: green
                        ? 482 + col * 19
                        : 714 - col * 18,
                    y: startY
                },

                hold: {
                    x: green
                        ? 478 + col * 19
                        : 743 - col * 18,
                    y: startY
                },

                second: {
                    x: green
                        ? 400 + col * 19
                        : 573 - col * 18,
                    y: startY +
                        range(seed + 5, -6, 6)
                },

                ending: {
                    x: green
                        ? 358 + col * 19
                        : 555 - col * 17,
                    y: startY
                }
            });
        }
    }

    function createArchers() {
        for (let i = 0; i < 10; i++) {
            const col = i % 5;
            const row = Math.floor(i / 5);
            const leaving = i < 6;

            const node = document.createElement("span");

            node.className =
                "uhud-archer-pawn " +
                (leaving ? "leaving" : "staying");

            node.setAttribute(
                "aria-hidden",
                "true"
            );

            archersLayer.appendChild(node);

            archers.push({
                node,
                index: i,
                leaving,

                start: {
                    x: 283 + col * 27,
                    y: 219 + row * 23
                },

                end: {
                    x: 326 + (i % 6) * 21,
                    y: 337 + (i % 3) * 31
                }
            });
        }
    }

    function createCavalry() {
        for (let i = 0; i < 7; i++) {
            const node = document.createElement("span");

            node.className = "uhud-rider";
            node.setAttribute(
                "aria-hidden",
                "true"
            );

            cavalryLayer.appendChild(node);

            riders.push({
                node,
                index: i
            });
        }
    }

    function createArrows() {
        for (let i = 0; i < 12; i++) {
            const node = document.createElement("span");

            node.className = "uhud-arrow";
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

    function soldierPosition(unit, t) {
        if (t < 2200) {
            return unit.start;
        }

        if (t < 5700) {
            return between(
                unit.start,
                unit.march,
                (t - 2200) / 3500
            );
        }

        if (t < 6800) {
            return between(
                unit.march,
                unit.contact,
                (t - 5700) / 1100
            );
        }

        if (t < 8700) {
            const p = between(
                unit.contact,
                unit.clash,
                (t - 6800) / 1900
            );

            const power = Math.sin(
                Math.PI * clamp(
                    (t - 6800) / 1900,
                    0,
                    1
                )
            );

            p.x += Math.sin(
                t / 180 + unit.seed
            ) * 6 * power;

            p.y += Math.cos(
                t / 200 + unit.seed
            ) * 5 * power;

            return p;
        }

        if (t < 10200) {
            return between(
                unit.clash,
                unit.push,
                (t - 8700) / 1500
            );
        }

        if (t < 11800) {
            return between(
                unit.push,
                unit.hold,
                (t - 10200) / 1600
            );
        }

        if (t < 15200) {
            return unit.hold;
        }

        if (t < 17000) {
            const p = between(
                unit.hold,
                unit.second,
                (t - 15200) / 1800
            );

            const power = Math.sin(
                Math.PI * clamp(
                    (t - 15200) / 1800,
                    0,
                    1
                )
            );

            p.x += Math.sin(
                t / 160 + unit.seed
            ) * 5 * power;

            p.y += Math.cos(
                t / 185 + unit.seed
            ) * 4 * power;

            return p;
        }

        if (t < 18900) {
            return {
                x: unit.second.x +
                    Math.sin(
                        t / 185 + unit.seed
                    ) * 5,

                y: unit.second.y +
                    Math.cos(
                        t / 205 + unit.seed
                    ) * 5
            };
        }

        return between(
            unit.second,
            unit.ending,
            (t - 18900) / 1100
        );
    }

    function updateSoldiers(t) {
        for (const unit of soldiers) {
            const p = soldierPosition(unit, t);

            const fighting =
                (t >= 6800 && t < 8700) ||
                (t >= 15200 && t < 18900);

            const scale = fighting
                ? 1 + Math.sin(
                    t / 125 + unit.seed
                ) * .055
                : 1;

            move(
                unit.node,
                p.x,
                p.y,
                scale
            );

            unit.node.style.opacity = "1";
        }
    }

    function archerPosition(unit, t) {
        if (!unit.leaving || t < 10200) {
            return unit.start;
        }

        return between(
            unit.start,
            unit.end,
            (t - 10200) / 1600
        );
    }

    function updateArchers(t) {
        for (const archer of archers) {
            const p = archerPosition(archer, t);

            move(
                archer.node,
                p.x,
                p.y
            );

            archer.node.style.opacity =
                !archer.leaving && t >= 15300
                    ? ".55"
                    : "1";
        }

        if (t < 10200) {
            archerStatus.textContent =
                "MEMIMPIN ±50 PEMANAH";
        } else if (t < 11800) {
            archerStatus.textContent =
                "SEBAGIAN PEMANAH TURUN";
        } else {
            archerStatus.textContent =
                "POSISI BUKIT TERBUKA";
        }
    }

    function updateCavalry(t) {
        const active = t >= 11800;

        for (const rider of riders) {
            if (!active) {
                rider.node.style.opacity = "0";
                continue;
            }

            const i = rider.index;

            const progress = clamp(
                (t - 11800 - i * 170) / 3500,
                0,
                1
            );

            const pathProgress = ease(progress);

            const point = cavalryRoute.getPointAtLength(
                routeLength * pathProgress
            );

            let x = point.x;
            let y = point.y;

            if (t >= 15300) {
                const attack = ease(
                    (t - 15300) / 1600
                );

                const targetX =
                    389 + (i % 4) * 20;

                const targetY =
                    337 +
                    Math.floor(i / 4) * 66 +
                    (i % 2) * 13;

                x = mix(x, targetX, attack);
                y = mix(y, targetY, attack);

                const fighting = ease(
                    (t - 16200) / 600
                );

                x += Math.sin(
                    t / 165 + i * 2
                ) * 8 * fighting;

                y += Math.cos(
                    t / 190 + i * 2.5
                ) * 7 * fighting;
            }

            if (t >= 18900) {
                const retreat = ease(
                    (t - 18900) / 1100
                );

                x = mix(
                    x,
                    490 + i * 18,
                    retreat
                );

                y = mix(
                    y,
                    390 + (i % 3) * 21,
                    retreat
                );
            }

            rider.node.style.opacity = "1";

            move(
                rider.node,
                x,
                y
            );
        }

        if (t >= 11800 && t < 15200) {
            const progress = ease(
                (t - 11800) / 3400
            );

            const point = cavalryRoute.getPointAtLength(
                routeLength * progress
            );

            cavalryBadge.style.left =
                clamp(point.x, 120, 850) + "px";

            cavalryBadge.style.top =
                clamp(point.y - 63, 80, 470) + "px";

            cavalryBadge.style.opacity = "1";
        } else {
            cavalryBadge.style.opacity = "0";
        }
    }

    function updateArrows(t) {
        const active =
            t >= 6500 && t < 8700;

        for (const arrow of arrows) {
            if (!active) {
                arrow.node.style.opacity = "0";
                continue;
            }

            const i = arrow.index;

            const archer =
                archers[i % archers.length];

            const target =
                soldiers[30 + (i * 3) % 36];

            const start = archerPosition(
                archer,
                t
            );

            const end = soldierPosition(
                target,
                t
            );

            const shot =
                t - 6500 - i * 125;

            if (shot < 0) {
                arrow.node.style.opacity = "0";
                continue;
            }

            const cycle =
                (shot % 1050) / 1050;

            if (cycle > .78) {
                arrow.node.style.opacity = "0";
                continue;
            }

            const progress = cycle / .78;

            const x = mix(
                start.x,
                end.x,
                progress
            );

            const y =
                mix(
                    start.y,
                    end.y,
                    progress
                ) -
                Math.sin(Math.PI * progress) * 20;

            const angle = Math.atan2(
                end.y - start.y,
                end.x - start.x
            ) * 180 / Math.PI;

            arrow.node.style.opacity = String(
                Math.sin(Math.PI * progress)
            );

            arrow.node.style.transform =
                `translate3d(${x}px, ${y}px, 0) rotate(${angle}deg) scale(.85)`;
        }
    }

    function updateLabels(t) {
        let greenX = 215;
        let redX = 785;

        if (t >= 2200 && t < 5700) {
            const progress = ease(
                (t - 2200) / 3500
            );

            greenX = mix(215, 365, progress);
            redX = mix(785, 635, progress);
        } else if (t >= 5700 && t < 8700) {
            greenX = 365;
            redX = 635;
        } else if (t >= 8700 && t < 10200) {
            const progress = ease(
                (t - 8700) / 1500
            );

            greenX = mix(365, 525, progress);
            redX = mix(635, 790, progress);
        } else if (t >= 10200 && t < 15200) {
            greenX = 525;
            redX = 790;
        } else if (t >= 15200) {
            const progress = ease(
                (t - 15200) / 4800
            );

            greenX = mix(525, 405, progress);
            redX = mix(790, 635, progress);
        }

        muslimLabel.style.left =
            greenX + "px";

        qurayshLabel.style.left =
            redX + "px";

        const hidden =
            (t >= 5700 && t < 8700) ||
            t >= 15200;

        muslimLabel.style.opacity =
            hidden ? "0" : "1";

        qurayshLabel.style.opacity =
            hidden ? "0" : "1";
    }

    function updateBanners(t) {
        const frontMuslim = soldiers[5];
        const frontQuraysh = soldiers[35];

        if (!frontMuslim || !frontQuraysh) {
            return;
        }

        const muslimPos = soldierPosition(
            frontMuslim,
            t
        );

        const qurayshPos = soldierPosition(
            frontQuraysh,
            t
        );

        if (greenFlag) {
            const x = muslimPos.x + 30;
            const y = muslimPos.y - 64;

            move(
                greenFlag,
                x,
                y
            );

            greenFlag.style.opacity = "1";
        }

        if (redFlag) {
            const x = qurayshPos.x - 31;
            const y = qurayshPos.y - 64;

            move(
                redFlag,
                x,
                y
            );

            redFlag.style.opacity = "1";
        }
    }

    function showImpact(
        node,
        x,
        y,
        t,
        start,
        end
    ) {
        if (t < start || t >= end) {
            node.style.opacity = "0";
            return;
        }

        const progress =
            ((t - start) % 850) / 850;

        node.style.opacity =
            String((1 - progress) * .75);

        node.style.transform =
            `translate3d(${x}px, ${y}px, 0) scale(${.4 + progress * 1.15})`;
    }

    function updateImpacts(t) {
        showImpact(
            frontImpact,
            499,
            385,
            t,
            5700,
            9400
        );

        showImpact(
            rearImpact,
            415,
            390,
            t,
            15200,
            20001
        );
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

        const title =
            storyCard.querySelector("span");

        const detail =
            storyCard.querySelector("strong");

        if (title) {
            title.textContent = phase.title;
        }

        if (detail) {
            detail.textContent = phase.detail;
        }

        const alertTitle =
            attackAlert.querySelector("strong");

        const alertText =
            attackAlert.querySelector("small");

        if (phase.scene === "two-fronts") {
            alertTitle.textContent =
                "PERTEMPURAN DARI DUA ARAH";

            alertText.textContent =
                "Kavaleri dari belakang, pasukan utama kembali maju.";
        } else {
            alertTitle.textContent =
                "SERANGAN DARI BELAKANG";

            alertText.textContent =
                "Kavaleri Khalid mencapai posisi belakang Muslim.";
        }
    }

    function updateBattle(t) {
        updateSoldiers(t);
        updateArchers(t);
        updateCavalry(t);
        updateArrows(t);
        updateLabels(t);
        updateBanners(t);
        updateImpacts(t);
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
                    ? "#b8463a"
                    : "#c4a068";

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

    function unlockLevelThree() {
        const key = progressKey + "=";

        const savedCookie = document.cookie
            .split(";")
            .map(item => item.trim())
            .find(item => item.startsWith(key));

        const previous = savedCookie
            ? Number.parseInt(
                savedCookie.slice(key.length),
                10
            )
            : 1;

        const current = Number.isFinite(previous)
            ? previous
            : 1;

        const next = Math.max(current, 3);

        document.cookie =
            `${progressKey}=${next}; Max-Age=31536000; Path=/; SameSite=Lax`;
    }

    function checkAnswer(answer) {
        if (!quizActive || gameOver) {
            return;
        }

        finishAnswer();

        if (answer === correctAnswer) {
            unlockLevelThree();
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

        window.location.href = "level3.html";
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
                "Video hadiah harus berdurasi lebih dari 15 detik."
            );
            return;
        }

        videoReady = true;

        try {
            rewardVideo.currentTime =
                videoStartTime;
        } catch (error) {
            videoReady = false;

            showVideoFailure(
                "Video tidak dapat dimulai dari detik ke-15."
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

    rewardVideo.addEventListener(
        "ended",
        nextLevel
    );

    rewardVideo.addEventListener("error", () => {
        if (rewardActive) {
            showVideoFailure(
                "Periksa file assets/reward-uhud.mp4."
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
    createArmy("quraysh", 36);

    createArchers();
    createCavalry();
    createArrows();

    updateLives();
    updateSoundButton();
    updateBattle(0);
});

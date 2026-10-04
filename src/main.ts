import { Game } from "./game/game.ts";
import { AdminLobbyView, GameEndView, GameView, LobbyView, setView } from "./view/view.ts";
import type { u8 } from "./types/integers.ts";

const app = document.querySelector<HTMLDivElement>("#app");
const button = document.querySelector<HTMLButtonElement>("#join");
const input = document.querySelector<HTMLInputElement>("#username-input");
const error = document.querySelector<HTMLDivElement>("#error");

let game: Game | undefined;
let wakeLock: WakeLockSentinel | undefined;

const keepScreenOn = async () => {
    if (!("wakeLock" in navigator)) return;

    try {
        wakeLock?.release();
        wakeLock = await navigator.wakeLock.request("screen");
    } catch (error) {
        console.error("Nie udało się zablokować wygaszania ekranu:", error);
    }
};

document.addEventListener("visibilitychange", () => {
    if (document.visibilityState === "visible") {
        keepScreenOn();
    }
});

const setError = (message: string) => {
    if (!error) return;

    error.textContent = message;
    error.style.display = "block";
};

const clearError = () => {
    if (!error) return;

    error.textContent = "";
    error.style.display = "none";
};

const updatePlayerList = (players: Array<string>) => {
    const playerList = document.querySelector<HTMLDivElement>("#player-list");

    if (playerList) {
        playerList.innerHTML = players.map(player => `
        <div class="player">
            <span class="player-name">${player}</span>
        </div>
    `).join("");
    }
}

const getUsername = () => input?.value.trim() ?? "";

const isUsernameValid = (username: string) => username.length >= 3 && username.length <= 12;

input?.addEventListener("input", () => {
    const username = getUsername();

    if (!isUsernameValid(username)) {
        setError("Nazwa musi mieć od 3 do 12 znaków.");
        return;
    }

    clearError();
});

button?.addEventListener("click", async () => {
    const username = getUsername();

    if (!isUsernameValid(username)) {
        setError("Nazwa musi mieć od 3 do 12 znaków.");
        return;
    }

    clearError();
    await keepScreenOn();

    game?.disconnect();
    game = new Game(username);

    game.onError.subscribe((message: string) => {
        setError(message);
    });

    game.onGameStart.subscribe(() => {
        setView(app!, GameView);

        const scan = document.querySelector<HTMLDivElement>("#scan");

        scan?.addEventListener("click", async () => {
            await game?.scan();
        });
    });

    game.onGameEnd.subscribe((leaderboard: Map<string, u8>) => {
        setView(app!, GameEndView);

        const leaderboardDiv = document.getElementById("leaderboard");

        if (!leaderboardDiv) {
            return;
        }

        leaderboardDiv.innerHTML = Array.from(leaderboard.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([username, score], index) => `
            <div class="player">
                <span class="player-rank">${index + 1}.</span>
                <span class="player-name">${username}</span>
                <span class="player-points">${score} pkt</span>
            </div>
        `)
            .join("");
    });

    game.onPlayerListUpdate.subscribe((players: Array<string>) => {
        updatePlayerList(players)
    })

    const success = await game.connect();

    if (!success) return;

    if (username === "Franek") {
        setView(app!, AdminLobbyView);

        const start = document.querySelector<HTMLButtonElement>("#start");

        start?.addEventListener("click", () => {
            game?.startGame();
        });
    } else {
        setView(app!, LobbyView);
    }

    updatePlayerList(game.players);
});

window.addEventListener("pagehide", () => {
    wakeLock?.release();
    game?.disconnect();
});
export type View = {
    body: string
}

export const BaseView = {
    body: `
    <div class="card" id="main">
        <div class="title">Gra</div>
        <input type="text" class="input" id="username-input" placeholder="Nazwa gracza">
        <div class="error" id="error"></div>
        <button id="join" class="button">Dołącz</button>
    </div>
    `
} as View;

export const LobbyView = {
    body: `
    <div class="card" id="main">
        <div class="title">Lobby</div>
        <div class="player-list" id="player-list"></div>
    </div>
    `
} as View;

export const AdminLobbyView = {
    body: `
    <div class="card" id="main">
        <div class="title">Lobby</div>
        <div class="player-list" id="player-list"></div>
        <button id="start" class="button">Start</button>
    </div>
    `
} as View;

export const GameView = {
    body: `
    <div class="card" id="main">
        <div class="title">Gra</div>
        <div id="qr-reader">
            <div class="scanner-overlay">
                <div class="scanner-frame">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        </div>
        <button id="scan" class="button">Skanuj</button>
    </div>
    `
} as View;

export const GameEndView = {
    body: `
    <div class="card" id="main">
        <div class="title">Koniec Gry</div>
        <div class="leaderboard" id="leaderboard"></div>
    </div>
    `
} as View;

export function setView(app: HTMLDivElement, view: View) {
    app.innerHTML = view.body;
}
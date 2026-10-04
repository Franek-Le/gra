

export type View = {
    body: string
}

export const BaseView = {
    body: `
    <div class="card" id="main">
        <div class="title">Stealth Game</div>
        <input type="text" class="input" id="username-input" placeholder="username">
        <div class="error" id="error"></div>
        <button id="join" class="button">Join</button>
    </div>
    `
} as View;

export const LobbyView = {
    body: `
    <div class="card" id="main">
        <div class="title">Lobby</div>
    </div>
    `
} as View;

export const AdminLobbyView = {
    body: `
    <div class="card" id="main">
        <div class="title">Lobby</div>
        <button id="start" class="button">Start</button>
    </div>
    `
}

export const GameView = {
    body: `
    <div class="card" id="main">
        <div class="title">Game</div>
        <div id="qr-reader"></div>
        <button id="scan" class="button">Scan</button>
    </div>
    `
}

export const GameEndView = {
    body: `
    <div class="card" id="main">
        <div class="title">Game End</div>
        <button id="scan" class="button">Exit</button>
    </div>
    `
}

export function setView(app: HTMLDivElement, view: View) {
    app.innerHTML = view.body;
}
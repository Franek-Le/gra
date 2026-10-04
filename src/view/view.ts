

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
        <div class="title">Gra</div>
        <div id="qr-reader"></div>
        <button id="scan" class="button">Skanuj</button>
    </div>
    `
}

export const GameEndView = {
    body: `
    <div class="card" id="main">
        <div class="title">Koniec Gry</div>
        <div class="text" id="winner"></div>
    </div>
    `
}

export function setView(app: HTMLDivElement, view: View) {
    app.innerHTML = view.body;
}
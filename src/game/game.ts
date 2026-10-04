import { Client } from "../client/client.ts";
import { Player } from "../player/player.ts";
import { PacketManager } from "../packet/packet-manager.ts";
import { EventHandler } from "../event/event-handler.ts";
import { u8 } from "../types/integers.ts";
import type { Packet } from "../packet/packet.ts";
import { Scanner } from "../scanner/scanner.ts";

export class Game {
    private readonly client: Client;
    private readonly player: Player
    private readonly packetManager: PacketManager;
    private scanner: Scanner | undefined;

    public readonly onError: EventHandler<string>;
    public readonly onGameStart: EventHandler<{}>;
    public readonly onGameEnd: EventHandler<Map<string, u8>>;
    public readonly onPlayerListUpdate: EventHandler<Array<string>>;

    public players: Array<string>;

    public isConnected: boolean;

    public constructor(username: string) {
        this.client = new Client();
        this.packetManager = new PacketManager(this.client, this);
        this.player = new Player(username, this.packetManager, this.client);
        this.scanner = undefined;

        this.onError = new EventHandler<string>();
        this.onGameStart = new EventHandler<{}>();
        this.onGameEnd = new EventHandler<Map<string, u8>>();
        this.onPlayerListUpdate = new EventHandler<Array<string>>();

        this.players = [];

        this.isConnected = false;
    }

    public async connect(): Promise<boolean> {
        try {
            const [success, message, players] = await this.player.connect();

            if (!success) {
                this.onError.invoke(message);
                return false;
            }

            this.players = players;

            this.isConnected = true;
            return true;
        } catch (error) {
            this.onError.invoke(error instanceof Error ? error.message : "Failed to join game.");
            return false;
        }
    }

    public disconnect() {
        if (!this.isConnected) {
            return;
        }

        this.player.disconnect();
    }

    public startGame() {
        const packet: Packet = this.packetManager.createPacket(u8(0x02), {});
        this.client.send(packet);
    }

    public async scan(): Promise<void> {
        if (this.scanner === undefined) {
            this.scanner = new Scanner();
        }

        const result: string = await this.scanner.scan();

        if (result === "") {
            return;
        }

        const packet: Packet = this.packetManager.createPacket(u8(0x03), {
            data: result
        });

        this.client.send(packet);
    }

}
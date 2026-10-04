import type { Client } from "../client/client.ts";
import type { GameEndServerPacketData, ServerPacket } from "./server-packet.ts";
import type { Packet, PacketData } from "./packet.ts";
import type { u8 } from "../types/integers.ts";
import { EventHandler } from "../event/event-handler.ts";
import { CURRENT_PROTOCOL_VERSION } from "../protocol/protocol.ts";
import { sleep } from "../utils/sleep.ts";
import { ServerPacketFactory } from "./server-packet-factory.ts";

import sizeof from "object-sizeof";
import type { Game } from "../game/game.ts";

export class PacketManager {
    private readonly client: Client;
    private readonly game: Game;

    public readonly onIncomingPacket: EventHandler<Packet>;

    public constructor(client: Client, game: Game) {
        this.client = client;
        this.game = game;

        this.onIncomingPacket = new EventHandler<Packet>();

        this.client.addEventListener("message", (event: Event) => {
            const message = event as MessageEvent<ArrayBuffer>;
            const packet = ServerPacketFactory.createServerPacket(new Uint8Array(message.data));
            this.handlePacket(packet);
        });
    }

    public handlePacket(packet: ServerPacket) {
        this.onIncomingPacket.invoke(packet);

        switch (packet.type) {
            case 0x00:
                this.game.onGameStart.invoke({});
                break;

            case 0x01:
                const gameEndPacketData = packet.payload as GameEndServerPacketData;
                this.game.onGameEnd.invoke(gameEndPacketData.winner);
                break;

            case 0x02:
                // intentionally not handled here
                // actually if I use the Game class then I could add a boolean that this would set to true and then the join handler would finish.
                break;
        }
    }

    public createPacket(type: u8, payload: PacketData): Packet {
        return {
            version: CURRENT_PROTOCOL_VERSION,
            type: type,
            timestamp: 0,
            payload_len: sizeof(payload),
            payload: payload,
        } as ServerPacket
    }

    public async waitForPacket(type: u8): Promise<ServerPacket> {
        let gotPacket: boolean = false;
        let packetResult: ServerPacket | undefined = undefined;

        this.onIncomingPacket.subscribe((packet: ServerPacket) => {
            if (packet.type == type) {
                gotPacket = true;
                packetResult = packet;
            }
        })

        while (!gotPacket) {
            await sleep(10);
        }

        return packetResult!;
    }
}
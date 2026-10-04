import type { PacketManager } from "../packet/packet-manager.ts";
import type { ConnectPacketData, DisconnectPacketData } from "../packet/packet.ts";
import { u8 } from "../types/integers.ts";
import type { Client } from "../client/client.ts";
import type { GameConnectResultServerPacketData, ServerPacket } from "../packet/server-packet.ts";

export class Player {
    private readonly username: string;
    private readonly packetManager: PacketManager;
    private readonly client: Client;

    public constructor(username: string, packetManager: PacketManager, client: Client) {
        this.username = username;
        this.packetManager = packetManager;
        this.client = client;
    }

    public async connect(): Promise<[boolean, string]> {
        await this.client.waitUntilOpen();

        const packet = this.packetManager.createPacket(u8(0x00), {
            username: this.username
        } as ConnectPacketData);

        const resultPromise = this.packetManager.waitForPacket(u8(0x02));

        this.client.send(packet);

        const resultPacket: ServerPacket = await resultPromise;
        const resultPacketData = resultPacket.payload as GameConnectResultServerPacketData;

        if (!resultPacketData.success) {
            return [false, "Failed to join game."];
        }

        return [true, "Successfully joined."];
    }

    public disconnect(): void {
        const packet = this.packetManager.createPacket(u8(0x01), {} as DisconnectPacketData);
        this.client.send(packet);
    }
}
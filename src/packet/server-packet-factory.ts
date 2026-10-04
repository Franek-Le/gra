import { Buffer } from "../buffer/buffer.js";
import type {
    GameConnectResultServerPacketData,
    GameEndServerPacketData,
    GameStartServerPacketData,
    ServerPacket,
    ServerPacketData
} from "./server-packet.ts";
import { i32, type u16, type u32, type u8 } from "../types/integers.js";

export class ServerPacketFactory {
    public constructor() {

    }

    public static createServerPacket(bytes: Uint8Array): ServerPacket {
        const buffer = new Buffer(i32(bytes.byteLength));
        buffer.writeBytes(bytes);
        buffer.reset();

        const version: u8 = buffer.readU8();
        const type: u8 = buffer.readU8();
        const timestamp: u32 = buffer.readU32();
        const payload_len: u16 = buffer.readU16();
        let data: ServerPacketData = this.deserializeServerPacketData(type, buffer);

        return {
            version: version,
            type: type,
            timestamp: timestamp,
            payload_len: payload_len,
            payload: data,
        } as ServerPacket;
    }

    private static deserializeServerPacketData(type: u8, buffer: Buffer): ServerPacketData {
        switch (type) {
            case 0x00:
                return {} as GameStartServerPacketData;

            case 0x01:
                return {
                    leaderboard: buffer.readStringU8Map(),
                } as GameEndServerPacketData;

            case 0x02:
                return {
                    success: buffer.readBoolean(),
                    message: buffer.readString(),
                    players: buffer.readStringArray(),
                } as GameConnectResultServerPacketData

            case 0x03:
                return {
                    players: buffer.readStringArray(),
                }
        }

        return {};
    }
}
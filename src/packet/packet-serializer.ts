import type { Packet, PacketData, ConnectPacketData, MovementPacketData } from "./packet.ts";
import { i32, type u8 } from "../types/integers.js";
import { Buffer } from "../buffer/buffer.js";

export class PacketSerializer {
    public static serialize(packet: Packet): Buffer {
        const buffer: Buffer = new Buffer(i32(24 + packet.payload_len));

        buffer.writeU8(packet.version);
        buffer.writeU8(packet.type);
        buffer.writeU32(packet.timestamp);
        buffer.writeU16(packet.payload_len);
        this.serializePayload(packet.type, packet.payload, buffer);

        return buffer;
    }

    private static serializePayload(type: u8, payload: PacketData, buffer: Buffer): void {
        switch (type) {
            case 0x00:
                const connectPacketData: ConnectPacketData = payload as ConnectPacketData;

                buffer.writeString(connectPacketData.username);

                break;

            case 0x01:
                break;

            case 0x02:
                const movementPacketData: MovementPacketData = payload as MovementPacketData;

                buffer.writeU32(movementPacketData.tick);
                buffer.writeI32(movementPacketData.lat);
                buffer.writeI32(movementPacketData.lon);
                buffer.writeU8(movementPacketData.accuracy);
                buffer.writeU16(movementPacketData.speed);

                break;
        }
    }
}
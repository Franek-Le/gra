import type { Packet, PacketData, ConnectPacketData, ScanPacketData } from "./packet.ts";
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
                break;

            case 0x03:
                const scanPacketData: ScanPacketData = payload as ScanPacketData;

                buffer.writeString(scanPacketData.data);

                break;
        }
    }
}
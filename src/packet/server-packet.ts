import type {u16, u32, u8} from "../types/integers.js";

export type GameStartServerPacketData = {};

export type GameEndServerPacketData = {
    winner: string,
}

export type GameConnectResultServerPacketData = {
    success: boolean,
    message: string,
}

export type ServerPacketData = GameStartServerPacketData | GameEndServerPacketData | GameConnectResultServerPacketData;

export type ServerPacket = {
    version: u8;
    type: u8;
    timestamp: u32;
    payload_len: u16;
    payload: ServerPacketData;
}
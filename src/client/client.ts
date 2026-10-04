import type { Packet } from "../packet/packet.ts";
import { PacketSerializer } from "../packet/packet-serializer.ts";
import { Buffer } from "../buffer/buffer.ts";

export class Client extends EventTarget {
    private readonly socket: WebSocket;

    public constructor() {
        super();

        this.socket = new WebSocket("wss://noncoagulative-nonabusively-anitra.ngrok-free.dev");
        this.socket.binaryType = "arraybuffer";

        //@ts-ignore
        this.socket.addEventListener("open", (event) => {
            this.dispatchEvent(new Event("open"));
        });

        this.socket.addEventListener("message", (event: MessageEvent) => {
            this.dispatchEvent(new MessageEvent("message", { data: event.data }));
        });

        this.socket.addEventListener("error", (event: Event) => {
            this.dispatchEvent(new ErrorEvent("error", { error: event }));
        });

        this.socket.addEventListener("close", (event) => {
            this.dispatchEvent(new CloseEvent("close", {
                code: event.code,
                reason: event.reason,
                wasClean: event.wasClean
            }));
        });
    }

    public send(packet: Packet) {
        const buffer: Buffer = PacketSerializer.serialize(packet);
        this.socket.send(buffer.toUint8Array().slice().buffer as ArrayBuffer);
    }

    public waitUntilOpen(): Promise<void> {
        if (this.socket.readyState === WebSocket.OPEN) {
            return Promise.resolve();
        }

        if (this.socket.readyState !== WebSocket.CONNECTING) {
            return Promise.reject(new Error("WebSocket is not connecting."));
        }

        return new Promise((resolve, reject) => {
            const cleanup = () => {
                this.socket.removeEventListener("open", onOpen);
                this.socket.removeEventListener("error", onError);
                this.socket.removeEventListener("close", onClose);
            };
            const onOpen = () => {
                cleanup();
                resolve();
            };
            const onError = () => {
                cleanup();
                reject(new Error("WebSocket connection failed."));
            };
            const onClose = () => {
                cleanup();
                reject(new Error("WebSocket closed before connecting."));
            };

            this.socket.addEventListener("open", onOpen, { once: true });
            this.socket.addEventListener("error", onError, { once: true });
            this.socket.addEventListener("close", onClose, { once: true });
        });
    }

    public close() {
        this.socket.close(1000, "Disconnected");
    }
}
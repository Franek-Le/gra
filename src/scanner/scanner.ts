import { Html5Qrcode } from "html5-qrcode";

export class Scanner {
    private readonly scanner: Html5Qrcode;

    public constructor() {
        this.scanner = new Html5Qrcode("qr-reader");
    }

    public scan(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.scanner.start(
                { facingMode: "environment" },
                {
                    fps: 10,
                    qrbox: { width: 250, height: 250 },
                    aspectRatio: 1,
                },
                (decodedText) => {
                    this.scanner.stop().then(() => resolve(decodedText)).catch(reject);
                },
                (errorMessage) => {
                    console.debug("QR scan failed:", errorMessage);
                },
            ).catch(reject);
        });
    }
}
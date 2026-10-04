import { Html5QrcodeScanner } from "html5-qrcode";

export class Scanner {
    private readonly scanner: Html5QrcodeScanner;

    public constructor() {
        this.scanner = new Html5QrcodeScanner("qr-reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
            rememberLastUsedCamera: true,
            showTorchButtonIfSupported: true,
        }, false);
    }

    public scan(): Promise<string> {
        return new Promise((resolve, reject) => {
            this.scanner.render((decodedText) => {
                this.scanner.clear().then(() => resolve(decodedText)).catch(reject);
            }, (errorMessage) => {
                console.debug("QR scan failed:", errorMessage);
            });
        });
    }
}
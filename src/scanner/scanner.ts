import { Html5QrcodeScanner } from "html5-qrcode";

export class Scanner {
    private readonly scanner: Html5QrcodeScanner;

    public constructor() {
        this.scanner = new Html5QrcodeScanner("qr-reader", {
            fps: 10,
            qrbox: { width: 250, height: 250 },
        }, false)
    }

    public scan(): string {
        this.scanner.render((decodedText) => {
            return decodedText;
        }, () => {

        })

        return "";
    }
}
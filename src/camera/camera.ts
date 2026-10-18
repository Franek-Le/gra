type CameraProfile = {
    exposureMode?: "continuous" | "single-shot" | "manual";
    iso?: number;
    shutterSeconds?: number;
    exposureCompensation?: number;
};

type NumericRange = { min: number; max: number };

type CameraCapabilities = {
    exposureMode?: string[];
    iso?: NumericRange;
    exposureTime?: NumericRange;
    exposureCompensation?: NumericRange;
};

export class CameraCapture {
    private stream: MediaStream | null = null;
    private track: MediaStreamTrack | null = null;
    private readonly video: HTMLVideoElement;
    private readonly button: HTMLButtonElement | null;
    private readonly profile: CameraProfile;

    constructor(video: HTMLVideoElement, button: HTMLButtonElement | null, profile: CameraProfile = {}) {
        this.video = video
        this.button = button
        this.profile = profile

        if (this.button) this.button.disabled = true;
    }

    async start(): Promise<void> {
        if (this.stream) return;

        try {
            this.stream = await navigator.mediaDevices.getUserMedia({
                audio: false,
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1920 },
                    height: { ideal: 1080 }
                }
            });

            this.track = this.stream.getVideoTracks()[0] ?? null;
            if (!this.track) throw new Error("No camera video track available.");

            this.video.srcObject = this.stream;

            await this.applyProfile();
            await this.video.play();

            if (this.button) this.button.disabled = false;
        } catch (error) {
            this.stop();
            throw error;
        }
    }

    async takePhoto(): Promise<Blob> {
        if (!this.track || !this.stream) {
            throw new Error("Camera is not started. Call start() first.");
        }

        const wasButtonDisabled = this.button?.disabled ?? false;
        if (this.button) this.button.disabled = true;

        try {
            return await this.capturePreviewAsCompressedImage();
        } finally {
            if (this.button) this.button.disabled = wasButtonDisabled || !this.stream;
        }
    }


    stop(): void {
        this.stream?.getTracks().forEach(track => track.stop());
        this.stream = null;
        this.track = null;
        this.video.pause();
        this.video.srcObject = null;

        if (this.button) this.button.disabled = true;
    }

    private async applyProfile(): Promise<void> {
        if (!this.track) return;

        const track = this.track as unknown as {
            getCapabilities?: () => CameraCapabilities;
        };

        const caps = track.getCapabilities?.();
        if (!caps) return;

        const mode = this.profile.exposureMode ?? (
            this.profile.shutterSeconds !== undefined ? "manual" :
                this.profile.exposureCompensation !== undefined ? "continuous" : undefined
        );

        const settings: Record<string, unknown> = {};

        if (mode && caps.exposureMode?.includes(mode)) {
            settings.exposureMode = mode;
        }

        if (this.profile.iso !== undefined && caps.iso) {
            settings.iso = { ideal: this.clamp(this.profile.iso, caps.iso) };
        }

        if (
            this.profile.shutterSeconds !== undefined &&
            caps.exposureTime &&
            mode === "manual" &&
            caps.exposureMode?.includes("manual")
        ) {
            settings.exposureTime = {
                ideal: this.clamp(this.profile.shutterSeconds, caps.exposureTime)
            };
        }

        if (
            this.profile.exposureCompensation !== undefined &&
            caps.exposureCompensation &&
            mode !== "manual"
        ) {
            settings.exposureCompensation = {
                ideal: this.clamp(this.profile.exposureCompensation, caps.exposureCompensation)
            };
        }

        if (Object.keys(settings).length > 0) {
            try {
                await this.track.applyConstraints({
                    advanced: [settings]
                } as unknown as MediaTrackConstraints);
            } catch (error) {
                console.warn("Some camera settings could not be applied.", error);
            }
        }
    }

    private clamp(value: number, range: NumericRange): number {
        return Math.max(range.min, Math.min(range.max, value));
    }

    private async capturePreviewAsCompressedImage(): Promise<Blob> {
        const sourceWidth = this.video.videoWidth;
        const sourceHeight = this.video.videoHeight;

        if (!sourceWidth || !sourceHeight) {
            throw new Error("Camera preview is not ready.");
        }

        const scale = Math.min(1, 640 / Math.max(sourceWidth, sourceHeight));
        const canvas = document.createElement("canvas");
        canvas.width = Math.max(1, Math.round(sourceWidth * scale));
        canvas.height = Math.max(1, Math.round(sourceHeight * scale));

        const context = canvas.getContext("2d");
        if (!context) throw new Error("Could not create image canvas.");

        context.drawImage(this.video, 0, 0, canvas.width, canvas.height);

        const avif = await this.canvasToBlob(canvas, "image/avif", 0.4);
        if (avif.type.toLowerCase() === "image/avif") return avif;

        const webp = await this.canvasToBlob(canvas, "image/webp", 0.55);
        if (webp.type.toLowerCase() === "image/webp") return webp;

        return this.canvasToBlob(canvas, "image/jpeg", 0.7);
    }

    private canvasToBlob(canvas: HTMLCanvasElement, type: string, quality: number): Promise<Blob> {
        return new Promise((resolve, reject) => {
            canvas.toBlob(
                blob => blob ? resolve(blob) : reject(new Error(`${type} encoding failed.`)),
                type,
                quality
            );
        });
    }
}
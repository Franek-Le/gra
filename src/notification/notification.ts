export type NotificationType = "success" | "error" | "info";

export function notify(message: string, type: NotificationType = "info", duration = 4000): void {
    const container = document.querySelector<HTMLDivElement>("#notifications");
    if (!container) return;

    const notification = document.createElement("div");
    notification.className = `notification notification--${type}`;
    notification.setAttribute("role", type === "error" ? "alert" : "status");

    const text = document.createElement("span");
    text.className = "notification__message";
    text.textContent = message;

    const closeButton = document.createElement("button");
    closeButton.className = "notification__close";
    closeButton.type = "button";
    closeButton.setAttribute("aria-label", "Zamknij powiadomienie");
    closeButton.textContent = "×";

    let timeoutId: ReturnType<typeof setTimeout> | undefined;
    let dismissed = false;

    const dismiss = () => {
        if (dismissed) return;
        dismissed = true;

        if (timeoutId !== undefined) clearTimeout(timeoutId);

        notification.classList.add("notification--leaving");
        notification.addEventListener("animationend", () => notification.remove(), { once: true });
    };

    closeButton.addEventListener("click", dismiss);
    notification.append(text, closeButton);
    container.append(notification);

    timeoutId = setTimeout(dismiss, duration);
}
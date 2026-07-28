export function bindImageZoomHandlers(container) {
    const previewEl = container.querySelector(".image-preview");
    if (!previewEl) return;

    const img = previewEl.querySelector("img");
    if (!img) return;

    let scale = 1;

    function updateScale() {
        img.style.transform = `scale(${scale})`;
    }

    const handleKeyDown = (e) => {
        const isPreviewActive =
            document.querySelector(".bottom-window__container.full")?.contains(previewEl) &&
            !previewEl.closest(".bottom-window.hidden");
        if (isPreviewActive) {
            if (e.key === "+" || e.key === "=") {
                e.preventDefault();
                scale = Math.min(scale * 1.25, 10);
                updateScale();
            } else if (e.key === "-" || e.key === "_") {
                e.preventDefault();
                scale = Math.max(scale * 0.8, 0.1);
                updateScale();
            } else if (e.key === "0") {
                e.preventDefault();
                scale = 1;
                updateScale();
            }
        }
    };

    window.addEventListener("keydown", handleKeyDown);
}

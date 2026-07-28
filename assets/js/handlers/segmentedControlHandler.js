export function setupSegmentedControl() {
    const SegmentedControlBaseSelector = ".segmented-control";
    const SegmentedControlIndividualSegmentSelector = ".segmented-control .option input";
    const SegmentedControlBackgroundPillSelector = ".segmented-control .selection";

    setup();

    function setup() {
        forEachElement(SegmentedControlBaseSelector, (elem) => {
            elem.addEventListener("change", updatePillPosition);
        });
        window.addEventListener("resize", updatePillPosition);
    }

    function updatePillPosition() {
        forEachElement(SegmentedControlIndividualSegmentSelector, (elem, index) => {
            if (elem.checked) moveBackgroundPillToElement(elem, index);
        });
    }

    function moveBackgroundPillToElement(elem, index) {
        console.log(elem.offsetWidth * index);
        document.querySelector(SegmentedControlBackgroundPillSelector).style.transform =
            "translateX(" + elem.offsetWidth * index + "px)";
    }

    function forEachElement(className, fn) {
        Array.from(document.querySelectorAll(className)).forEach(fn);
    }
}

export class _Loader {
    constructor(el, settings = {}) {
        this.el = el;
        const settingsReplacement = {
            size: "--uib-size",
            color: "--uib-color",
            speed: "--uib-speed",
            stroke: "--uib-stroke",
        };
        this.settings = {};
        this.clearSettings = settings;
        this.classlist = [];

        if (Object.keys(settings).length > 0) {
            Object.keys(settings).forEach((k) => {
                if (k in settingsReplacement) {
                    this.settings[settingsReplacement[k]] = settings[k];
                }
            });
        }

        this.finalSettings = [];
        Object.keys(this.settings).forEach((k) => {
            this.finalSettings.push(`${k}: ${this.settings[k]}`);
        });

        "pos" in settings ? this.classlist.push(settings.pos) : false;
    }

    render() {
        if (this.el) {
            const html = `
                <div class="content-loader ${this.classlist.join(" ")} container loader-hidden" id="content-loader" style="${this.finalSettings.join(";")}">
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                    <div class="line"></div>
                </div>
            `;

            if ("method" in this.clearSettings) {
                if (this.clearSettings.method == "add") {
                    this.el.innerHTML += html;
                } else if (this.clearSettings.method == "inner") {
                    this.el.innerHTML = html;
                }
            } else {
                this.el.innerHTML += html;
            }

            setTimeout(() => {
                this.el.querySelector("#content-loader").classList.remove("loader-hidden");
            }, 200);
        }
    }
    remove() {
        if (this.el.querySelector("#content-loader")) {
            this.el.querySelector("#content-loader").classList.add("content-loader-hidden");

            this.el.querySelector("#content-loader").addEventListener("transitionend", () => {
                this.el.querySelector("#content-loader").remove();
            });
        }
    }
}

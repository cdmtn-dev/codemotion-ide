export class _CodeTemplates {
    static templates = {
        js: [
            {
                name: "DOM Ready",
                content: `
                document.addEventListener("DOMContentLoaded", () => {
                    
                });`,
            },
            {
                name: "Utility template",
                content: `"use strict";`,
            },
        ],
        html: [
            {
                name: "Basic HTML Template",
                content: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>%{{ Document-Title }}</title>
                </head>
                <body>
                \t
                </body>
                </html>`,
            },
            {
                name: "Basic HTML Template with CSS & JS",
                content: `
                <!DOCTYPE html>
                <html lang="en">
                <head>
                    <meta charset="UTF-8">
                    <meta name="viewport" content="width=device-width, initial-scale=1.0">
                    <title>%{{ Document-Title }}</title>

                    <link rel="stylesheet" href="style.css">
                    <script src="script.js" defer></script>
                </head>
                <body>
                \t
                </body>
                </html>
                `,
            },
        ],
        php: [
            {
                name: "Basic template",
                content: `
                <?php

                declare(strict_types=1);
                `,
            },
        ],
    };

    static add(name, object) {
        _CodeTemplates.templates[name] = object;
    }

    static get jsx() {
        return _CodeTemplates.templates.js;
    }

    static list() {
        return {
            ..._CodeTemplates.templates,
            jsx: _CodeTemplates.jsx,
        };
    }
}

function basicMinifyCss(cssCode) {
    cssCode = cssCode.replace(/\/\*[\s\S]*?\*\//g, "");
    cssCode = cssCode.replace(/(\r\n|\n|\r)/gm, "");
    cssCode = cssCode.replace(/\s+/g, " ");
    cssCode = cssCode.replace(/\s*([{};:])\s*/g, "$1");
    cssCode = cssCode.replace(/;}/g, "}");
    return cssCode.trim();
}

module.exports = { basicMinifyCSS: basicMinifyCss };

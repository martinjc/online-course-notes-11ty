import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownItFootnote from "markdown-it-footnote";
import markdownItEmoji from "markdown-it-emoji";
import markdownIt from "markdown-it";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import shortcodes from "./build/shortcodes.js";
import * as sass from "sass";
import fs from "fs";

export default function (eleventyConfig) {
    const PRODUCTION_DIR = 'online-course-notes-11ty';
    const isProduction = process.env.ELEVENTY_RUN_MODE === "build" || process.env.NODE_ENV === "production";

    // Watch Sass folder
    eleventyConfig.addWatchTarget("src/_sass/");

    // Compile Sass before building the site
    eleventyConfig.on("eleventy.before", async () => {
        const result = sass.compile("src/_sass/main.scss", {
            style: isProduction ? "compressed" : "expanded"
        });
        fs.mkdirSync("public/css", { recursive: true });
        fs.writeFileSync("public/css/main.css", result.css);
    });

    // Copy root files and examples
    eleventyConfig.addPassthroughCopy({"src/_root/*.*": "./"});
    eleventyConfig.addPassthroughCopy("src/examples");

    // Syntax highlighting & navigation plugins
    eleventyConfig.addPlugin(syntaxHighlight);
    eleventyConfig.addPlugin(eleventyNavigationPlugin);

    // Markdown Library configuration
    let markdownLib = markdownIt({
        html: true,
        breaks: true,
        linkify: true,
        typographer: true,
    })
    .use(markdownItFootnote)
    .use(markdownItEmoji);

    eleventyConfig.setLibrary('md', markdownLib);

    // Custom filters
    function sortByPageOrder(values) {
        return values.slice().sort((a, b) => Math.sign(a.data.order - b.data.order));
    }
    eleventyConfig.addFilter("sortByPageOrder", sortByPageOrder);

    // Custom shortcodes
    eleventyConfig.addShortcode("image", shortcodes.imageShortcode);
    eleventyConfig.addShortcode("questions", shortcodes.insertQuestions);
    eleventyConfig.addShortcode("panopto", shortcodes.insertPanopto);
    eleventyConfig.addShortcode("reponame", shortcodes.getRepoName);
    eleventyConfig.addPairedShortcode("panel", shortcodes.insertPanel);

    return {
      pathPrefix: isProduction ? PRODUCTION_DIR : '/',
      dir: {
        input: "./src",
        output: "./public",
        includes: "_includes"
      }
    };
}

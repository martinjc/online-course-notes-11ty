import { HtmlBasePlugin } from "@11ty/eleventy";
import syntaxHighlight from "@11ty/eleventy-plugin-syntaxhighlight";
import markdownItFootnote from "markdown-it-footnote";
import markdownItEmoji from "markdown-it-emoji";
import markdownIt from "markdown-it";
import eleventyNavigationPlugin from "@11ty/eleventy-navigation";
import shortcodes from "./build/shortcodes.js";
import { execSync } from "child_process";

export default function (eleventyConfig) {
    const PRODUCTION_DIR = 'online-course-notes-11ty';
    const isProduction = process.env.ELEVENTY_RUN_MODE === "build" || process.env.NODE_ENV === "production";

    // Enable HTML base plugin for pathPrefix rewriting
    eleventyConfig.addPlugin(HtmlBasePlugin);

    // Watch CSS input file
    eleventyConfig.addWatchTarget("src/css/main.css");

    // Compile Tailwind CSS before building the site
    eleventyConfig.on("eleventy.before", async () => {
        execSync("npx @tailwindcss/cli -i src/css/main.css -o public/css/main.css --minify");
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
    eleventyConfig.addPairedShortcode("panel", shortcodes.insertPanel);
    eleventyConfig.addPairedShortcode("accordion", shortcodes.insertAccordion);
    eleventyConfig.addPairedShortcode("gallery", shortcodes.insertGallery);
    eleventyConfig.addPairedShortcode("galleryslide", shortcodes.insertGallerySlide);
    eleventyConfig.addPairedShortcode("slide", shortcodes.insertGallerySlide);

    return {
      pathPrefix: isProduction ? PRODUCTION_DIR : '/',
      dir: {
        input: "./src",
        output: "./public",
        includes: "_includes"
      }
    };
}

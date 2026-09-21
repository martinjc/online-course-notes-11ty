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
    function getOrderPath(item, itemMap) {
        const path = [];
        let current = item;
        const visited = new Set();
        while (current && !visited.has(current)) {
            visited.add(current);
            const order = Number(current.data?.eleventyNavigation?.order ?? current.data?.order ?? 0);
            path.unshift(order);
            const parentKey = current.data?.eleventyNavigation?.parent || current.data?.parent;
            if (!parentKey || !itemMap.has(parentKey)) {
                break;
            }
            current = itemMap.get(parentKey);
        }
        return path;
    }

    function comparePageOrder(a, b, itemMap) {
        const pathA = getOrderPath(a, itemMap);
        const pathB = getOrderPath(b, itemMap);
        const len = Math.min(pathA.length, pathB.length);
        for (let i = 0; i < len; i++) {
            if (pathA[i] !== pathB[i]) {
                return pathA[i] - pathB[i];
            }
        }
        if (pathA.length !== pathB.length) {
            return pathA.length - pathB.length;
        }
        const titleA = a.data?.title || "";
        const titleB = b.data?.title || "";
        return titleA.localeCompare(titleB);
    }

    function sortByPageOrder(values) {
        if (!values || !Array.isArray(values)) {
            return [];
        }
        const itemMap = new Map();
        for (const item of values) {
            const key = item.data?.eleventyNavigation?.key || item.data?.title;
            if (key) {
                itemMap.set(key, item);
            }
        }
        return values.slice().sort((a, b) => comparePageOrder(a, b, itemMap));
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

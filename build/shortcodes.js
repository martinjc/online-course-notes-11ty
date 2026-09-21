import markdownIt from "markdown-it";
import Image from '@11ty/eleventy-img';
import fs from "fs";
import path from "path";

// Shared markdown-it instance for performance
const md = new markdownIt({ html: true });

function escapeAttr(str) {
    return String(str || "")
        .replace(/&/g, '&amp;')
        .replace(/"/g, '&quot;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

const shortcodes = {
    // Embedding questions from data files into the notes page template
    insertQuestions: (questions) => {
        let template = ``;
        questions.forEach((q, i) => {
            template += `
<div class="question-block" id="q-block${i}">
<p class="question" id="q${i}">${q.question}</p>`;
            q.answers.forEach((a, j) => {
                template += `
<div class="answer-block" id="q${i}-a-block${j}" role="button" tabindex="0" aria-pressed="false" data-correct="${a.correct}">
<p class="answer" id="q${i}-a${j}">${a.answer}</p>
<p class="feedback hidden">${a.feedback}</p>
</div>
                `;
            });
            template += `
</div>
`;
        });
        return template;
    },

    // Panopto embed shortcode
    insertPanopto: (panoptoID) => {
        return `
<div class="panoptoembed"><iframe src="https://cardiff.cloud.panopto.eu/Panopto/Pages/Embed.aspx?id=${panoptoID}&v=1" width="600" height="320" style="padding: 0px; border: 1px solid #464646;" frameborder="0" allowfullscreen allow="autoplay"></iframe></div>
<p><small>If the embed above does not work here is a <a href="https://cardiff.cloud.panopto.eu/Panopto/Pages/Viewer.aspx?id=${panoptoID}" target="_blank" rel="noopener noreferrer">link to the full version of the video</a></small></p>`;
    },

    insertPanel: (content, type = "info", header) => {
        content = md.render(content.trim());
        const normalizedType = (type || "info").toLowerCase().trim();

        const panelIcons = {
            info: `<svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`,
            warning: `<svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            prompt: `<svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><polyline points="4 17 10 11 4 5"></polyline><line x1="12" y1="19" x2="20" y2="19"></line></svg>`,
            question: `<svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><circle cx="12" cy="12" r="10"></circle><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>`,
            aside: `<svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path></svg>`
        };

        const defaultIcon = `<svg class="panel-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line></svg>`;

        const icon = panelIcons[normalizedType] || defaultIcon;

        let title = header;
        if (title === undefined || title === null) {
            title = normalizedType.charAt(0).toUpperCase() + normalizedType.slice(1);
        }
        const titleHtml = title ? `<span>${title}</span>` : "";

        return `
<div class="panel panel-${normalizedType}">
<div class="panel-header">${icon}${titleHtml}</div>
<div class="panel-body">${content}</div>
</div>`;
    },

    insertAccordion: (content, title) => {
        content = md.render(content.trim());
        return `
<details class="accordion my-6 border border-border-line rounded-lg overflow-hidden bg-card shadow-cu-sm group w-full max-w-full">
  <summary class="flex justify-between items-center px-5 py-4 font-bold text-ink cursor-pointer list-none select-none hover:bg-red-50 hover:text-brand-dark transition-colors duration-200">
    <span>${title}</span>
    <svg class="w-5 h-5 text-slate group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
    </svg>
  </summary>
  <div class="accordion-content px-6 py-5 border-t border-border-line prose overflow-x-auto w-full max-w-full">
    ${content}
  </div>
</details>
`;
    },

    imageShortcode: async function (src, alt = "", caption = "", sizes = "(min-width: 30em) 30vw, 100vw") {
        if (typeof src === "object" && src !== null) {
            ({ src, alt = "", caption = "", sizes = "(min-width: 30em) 30vw, 100vw" } = src);
        }

        // If 3rd argument was passed as a responsive sizes media query instead of caption
        if (typeof caption === "string" && (caption.startsWith("(") || caption.endsWith("vw"))) {
            sizes = caption;
            caption = "";
        }

        let captionHtml = "";
        if (caption && typeof caption === "string" && caption.trim().length > 0) {
            captionHtml = `\n<figcaption class="figure-caption mt-2 text-sm text-slate text-center">${md.renderInline(caption.trim())}</figcaption>`;
        }

        if (src.endsWith('.gif')) {
            const filename = path.basename(src);
            const destDir = "./public/img/";
            fs.mkdirSync(destDir, { recursive: true });
            fs.copyFileSync(src, path.join(destDir, filename));
            return `<figure class="figure my-6 text-center"><img src="/img/${filename}" alt="${alt}" loading="lazy" decoding="async">${captionHtml}</figure>`;
        }

        let metadata = await Image(src, {
            widths: [640, 768, 1024, 1366, 1600, 1920],
            formats: ["avif", "jpeg"],
            outputDir: "./public/img/"
        });

        let imageAttributes = {
            alt,
            sizes,
            loading: "lazy",
            decoding: "async",
        };

        const imageHtml = Image.generateHTML(metadata, imageAttributes);
        return `<figure class="figure my-6 text-center">${imageHtml}${captionHtml}</figure>`;
    },

    insertGallery: function (content, title = "Gallery") {
        const slideMatches = content ? content.match(/data-gallery-slide/g) : null;
        const slideCount = slideMatches ? slideMatches.length : 1;

        const dotsHtml = Array.from({ length: slideCount }, (_, i) => `<button type="button" class="gallery-dot${i === 0 ? ' active' : ''}" role="tab" aria-selected="${i === 0 ? 'true' : 'false'}" aria-label="Slide ${i + 1}" data-index="${i}"></button>`).join("");

        const escapedTitle = escapeAttr(title || 'Gallery');

        return `
<div class="gallery my-8 border border-border-line rounded-cu bg-card shadow-cu-sm overflow-hidden" role="region" aria-roledescription="carousel" aria-label="${escapedTitle}">
  <div class="gallery-header flex items-center justify-between px-5 py-3.5 border-b border-border-line bg-card">
    <div class="flex items-center gap-2.5 font-bold text-ink text-base">
      <svg class="w-5 h-5 text-brand shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
      </svg>
      <span>${title || 'Gallery'}</span>
    </div>
    <div class="gallery-counter font-mono text-xs font-bold px-2.5 py-1 rounded-full bg-cloud text-slate">
      <span class="gallery-current">1</span> / <span class="gallery-total">${slideCount}</span>
    </div>
  </div>
  <div class="gallery-track flex items-start overflow-x-auto overflow-y-visible snap-x snap-mandatory scroll-smooth no-scrollbar focus:outline-none" tabindex="0">
    ${content}
  </div>
  <div class="gallery-footer flex items-center justify-between px-5 py-3 border-t border-border-line bg-cloud">
    <button type="button" class="gallery-prev inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-line bg-card hover:bg-white text-ink font-semibold text-sm transition-all shadow-cu-sm hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border-line" aria-label="Previous slide">
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M15 19l-7-7 7-7"/></svg>
      <span>Previous</span>
    </button>
    <div class="gallery-dots flex items-center gap-2" role="tablist" aria-label="Slides">${dotsHtml}</div>
    <button type="button" class="gallery-next inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border-line bg-card hover:bg-white text-ink font-semibold text-sm transition-all shadow-cu-sm hover:border-brand disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:border-border-line" aria-label="Next slide">
      <span>Next</span>
      <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M9 5l7 7-7 7"/></svg>
    </button>
  </div>
</div>`;
    },

    insertGallerySlide: async function (content, src, alt = "", caption = "", sizes = "(min-width: 30em) 30vw, 100vw") {
        if (typeof src === "object" && src !== null) {
            ({ src, alt = "", caption = "", sizes = "(min-width: 30em) 30vw, 100vw" } = src);
        }

        let imageHtml = "";
        if (src && typeof src === "string" && src.trim().length > 0) {
            imageHtml = await shortcodes.imageShortcode(src, alt, caption, sizes);
        }

        const trimmedContent = content ? content.trim() : "";
        const renderedContent = trimmedContent ? md.render(trimmedContent) : "";

        return `
<div class="gallery-slide snap-start shrink-0 w-full min-w-full box-border p-4 md:p-6" data-gallery-slide role="group" aria-roledescription="slide">
  ${imageHtml}
  ${renderedContent ? `<div class="gallery-slide-content prose max-w-full mt-4">${renderedContent}</div>` : ''}
</div>`;
    }

};

export default shortcodes;


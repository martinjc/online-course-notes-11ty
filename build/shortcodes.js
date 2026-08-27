import markdownIt from "markdown-it";
import Image from '@11ty/eleventy-img';
import fs from "fs";
import path from "path";

export default {
    // Embedding questions from data files into the notes page template
    insertQuestions: (questions) => {
        let template = ``;
        questions.forEach((q, i) => {
            template += `
<div class="question-block" id="q-block${i}">
<p class="question" id="q${i}">${q.question}</p>`;
            q.answers.forEach((a, j) => {
                template += `
<div class="answer-block" id="a-block${j}" data-correct="${a.correct}">
<p class="answer" id="a${j}">${a.answer}</p>
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

    // Alright, this one is going to get very little use unless you are also an academic at Cardiff University who wants to embed videos from our Panopto instance into your course notes...
    insertPanopto: (panoptoID) => {
        return `
<div class="panoptoembed"><iframe src="https://cardiff.cloud.panopto.eu/Panopto/Pages/Embed.aspx?id=${panoptoID}&v=1" width="600" height="320" style="padding: 0px; border: 1px solid #464646;" frameborder="0" allowfullscreen allow="autoplay"></iframe></div>
<p><small>If the embed above does not work here is a <a href="https://cardiff.cloud.panopto.eu/Panopto/Pages/Viewer.aspx?id=${panoptoID}" target="blank">link to the full version of the video</a></small></p>`
    },


    insertPanel: (content, type, header) => {
        let md = new markdownIt();
        content = md.renderInline(content);
        let template = ``;
        template += `
<div class="panel panel-${type}">
<div class="panel-header">${header}</div>
<div class="panel-body">${content}</div>
</div>`
        return template;
    },

    insertAccordion: (content, title) => {
        let md = new markdownIt({ html: true });
        content = md.render(content);
        return `
<details class="my-6 border border-border-line rounded-lg overflow-hidden bg-card shadow-cu-sm group">
  <summary class="flex justify-between items-center px-5 py-4 font-bold text-ink cursor-pointer list-none select-none hover:bg-red-50 hover:text-brand-dark transition-colors duration-200">
    <span>${title}</span>
    <svg class="w-5 h-5 text-slate group-open:rotate-180 transition-transform duration-200" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M19 9l-7 7-7-7" />
    </svg>
  </summary>
  <div class="px-5 py-4 border-t border-border-line bg-cloud prose">
    ${content}
  </div>
</details>
`;
    },

    imageShortcode: async function (src, alt = "", sizes = "(min-width: 30em) 30vw, 100vw") {
        if (src.endsWith('.gif')) {
            const filename = path.basename(src);
            const destDir = "./public/img/";
            fs.mkdirSync(destDir, { recursive: true });
            fs.copyFileSync(src, path.join(destDir, filename));
            return `<img src="/img/${filename}" alt="${alt}" loading="lazy" decoding="async">`;
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

        return Image.generateHTML(metadata, imageAttributes);
    }

}


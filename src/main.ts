import {
    MarkdownPostProcessorContext,
    MarkdownRenderChild,
    Plugin,
} from "obsidian";
import { APOCALYPSE } from "./apocalypse";
import { ParseError } from "./error";
import { GNOMEYLAND } from "./gnomeyland";
import { TextMapperParser } from "./parser";

export default class TextMapperPlugin extends Plugin {
    async onload() {
        console.log("Loading Obsidian TextMapper.");
        this.registerMarkdownCodeBlockProcessor(
            "text-mapper",
            this.processMarkdown.bind(this)
        );
    }

    async processMarkdown(
        source: string,
        el: HTMLElement,
        ctx: MarkdownPostProcessorContext
    ): Promise<any> {
        try {
            ctx.addChild(new TextMapper(el, ctx.docId, source));
        } catch (e) {
            console.log("text mapper error", e);
            ctx.addChild(new ParseError(el));
        }
    }

    onunload() {}
}

export class TextMapper extends MarkdownRenderChild {
    textMapperEl: HTMLDivElement;

    constructor(containerEl: HTMLElement, docId: string, source: string) {
        super(containerEl);
        this.textMapperEl = this.containerEl.createDiv({ cls: "textmapper" });

        const totalSource = source
            .split("\n")
            .concat(GNOMEYLAND.split("\n"))
            .concat(APOCALYPSE.split("\n"));

        const parser = new TextMapperParser(docId);
        parser.process(totalSource);
        parser.svg(this.textMapperEl);
    }
}

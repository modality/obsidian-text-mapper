import {
    MarkdownPostProcessorContext,
    MarkdownRenderChild,
    Plugin,
} from "obsidian";
import { ParseError } from "./error";
import { GNOMEYLAND } from "./gnomeyland";
import { TextMapperParser } from "./parser";

export default class TextMapperPlugin extends Plugin {
    async onload() {
        console.log("loading text mapper");
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
            ctx.addChild(new TextMapper(el, ctx.sourcePath, source));
        } catch (e) {
            console.log("text mapper error", e);
            ctx.addChild(new ParseError(el));
        }
    }

    onunload() {}
}

export class TextMapper extends MarkdownRenderChild {
    textMapperEl: HTMLDivElement;
    parser: TextMapperParser;

    constructor(containerEl: HTMLElement, context: string, source: string) {
        super(containerEl);
        this.textMapperEl = this.containerEl.createDiv({ cls: "textmapper" });

        const totalSource = source.split("\n").concat(GNOMEYLAND.split("\n"));

        this.parser = new TextMapperParser();
        this.parser.process(totalSource);
        this.parser.svg(this.textMapperEl);
    }
}

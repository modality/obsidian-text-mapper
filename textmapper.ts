import { MarkdownRenderChild } from "obsidian";
import { GNOMEYLAND } from "gnomeyland";
import { TextMapperParser } from "parser";

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

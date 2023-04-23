import { MarkdownPostProcessorContext, parseYaml, Plugin } from "obsidian";
import { TextMapper } from "textmapper";
import { ParseError } from "error";

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

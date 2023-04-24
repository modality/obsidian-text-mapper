import { MarkdownRenderChild } from "obsidian";

export class ParseError extends MarkdownRenderChild {
    outputEl: HTMLDivElement;

    constructor(containerEl: HTMLElement) {
        super(containerEl);
        containerEl.innerText = "Error!";
    }
}

import { SVGElement } from "./constants";

export class Spline {
    types: string;
    label: string;
    side: string;
    start: string;
    id: string;
    points: number[][];

    constructor() {
        this.points = [];
    }

    addPoint(x: string, y: string) {
        const nX = parseInt(x);
        const nY = parseInt(y);
        this.points.push([nX, nY]);
    }

    svg(svgEl: SVGElement): void {}

    svgLabel(
        svgEl: SVGElement,
        labelAttributes: any,
        glowAttributes: any
    ): void {
        if (this.label === undefined) {
            return;
        }
        const pathAttributes: any = {
            href: `#${this.id}`,
        };
        // Default side is left, but if the line goes from right to left, then "left"
        // means "upside down", so allow people to control it.
        if (this.side !== undefined) {
            pathAttributes["side"] = this.side;
        } else if (
            this.points[1][0] < this.points[0][0] ||
            (this.points.length > 2 && this.points[2][0] < this.points[0][0])
        ) {
            pathAttributes["side"] = "right";
        }
        if (this.start !== undefined) {
            pathAttributes["startOffset"] = this.start;
        }

        const gEl = svgEl.createSvg("g");
        const glowEl = gEl.createSvg("text", {
            attr: {
                ...labelAttributes,
                ...glowAttributes,
            },
        });
        const glowPathEl = glowEl.createSvg("textPath", {
            attr: pathAttributes,
        });
        glowPathEl.textContent = this.label;

        const labelEl = gEl.createSvg("text", { attr: labelAttributes });
        const labelPathEl = labelEl.createSvg("textPath", {
            attr: pathAttributes,
        });
        labelPathEl.textContent = this.label;
    }
}

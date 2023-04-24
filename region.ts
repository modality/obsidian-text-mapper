import { SVGElement } from "./constants";
import { Point, Orientation } from "orientation";

export class Region {
    x: number;
    y: number;
    types: string[];
    label: string;
    size: string;

    constructor() {
        this.types = [];
    }

    pixels(orientation: Orientation, addX: number, addY: number): number[] {
        const pix = orientation.pixels(new Point(this.x, this.y), addX, addY);
        return [pix.x, pix.y];
    }

    svg(svgEl: SVGElement, orientation: any): void {
        let data = "";
        const pix = orientation.pixels(new Point(this.x, this.y));
        for (const type of this.types) {
            svgEl.createSvg("use", {
                attr: {
                    x: pix.x.toFixed(1),
                    y: pix.y.toFixed(1),
                    href: `#${type}`,
                },
            });
        }
    }

    svgCoordinates(
        svgEl: SVGElement,
        orientation: Orientation,
        textAttributes: any
    ): void {
        const pix = orientation.pixels(
            new Point(this.x, this.y),
            0,
            -orientation.dy * orientation.labelOffset
        );

        const coordEl = svgEl.createSvg("text", {
            attr: {
                ...textAttributes,
                "text-anchor": "middle",
                x: pix.x.toFixed(1),
                y: pix.y.toFixed(1),
            },
        });
        coordEl.textContent = `${this.x}.${this.y}`;
    }

    svgRegion(
        svgEl: SVGElement,
        orientation: Orientation,
        attributes: any
    ): void {
        let id = "hex";
        if (this.x < 100 && this.y < 100) {
            id += `${this.x}${this.y}`;
        } else {
            id += `${this.x}.${this.y}`;
        }
        const points = orientation
            .hexCorners()
            .map((corner: Point) => {
                return orientation
                    .pixels(new Point(this.x, this.y), corner.x, corner.y)
                    .toString();
            })
            .join(" ");

        svgEl.createSvg("polygon", {
            attr: {
                ...attributes,
                id,
                points,
            },
        });
    }

    svgLabel(
        svgEl: SVGElement,
        orientation: Orientation,
        labelAttributes: any,
        glowAttributes: any
    ): void {
        if (this.label === undefined) {
            return;
        }
        const attributes = {
            ...labelAttributes,
        };
        if (this.size !== undefined) {
            attributes["font-size"] = this.size;
        }
        const pix = orientation.pixels(
            new Point(this.x, this.y),
            0,
            orientation.dy * orientation.labelOffset
        );
        const gEl = svgEl.createSvg("g");

        const glowEl = gEl.createSvg("text", {
            attr: {
                "text-anchor": "middle",
                x: pix.x.toFixed(1),
                y: pix.y.toFixed(1),
                ...attributes,
                ...glowAttributes,
            },
        });
        glowEl.textContent = this.label;

        const labelEl = gEl.createSvg("text", {
            attr: {
                "text-anchor": "middle",
                x: pix.x.toFixed(1),
                y: pix.y.toFixed(1),
                ...attributes,
            },
        });
        labelEl.textContent = this.label;
    }
}

import { DX, DY, HEX_CORNERS, SVGElement } from "./constants";

export class Region {
    x: number;
    y: number;
    types: string[];
    label: string;
    size: string;

    constructor() {
        this.types = [];
    }

    pixels(addX: number, addY: number) {
        return [
            (this.x * DX * 3) / 2 + addX,
            this.y * DY - ((this.x % 2) * DY) / 2 + addY,
        ];
    }

    svg(svgEl: SVGElement): void {
        let data = "";
        const pixels = this.pixels(0, 0);
        for (const type of this.types) {
            svgEl.createSvg("use", {
                attr: {
                    x: pixels[0].toFixed(1),
                    y: pixels[1].toFixed(1),
                    href: `#${type}`,
                },
            });
        }
    }

    svgCoordinates(svgEl: SVGElement, textAttributes: string): void {
        const pixels = this.pixels(0, -DY * 0.4);
        const coordEl = svgEl.createSvg("text", {
            attr: {
                "text-anchor": "middle",
                x: pixels[0].toFixed(1),
                y: pixels[1].toFixed(1),
            },
        });
        coordEl.textContent = `${this.x}.${this.y}`;
    }

    svgRegion(svgEl: SVGElement, attributes: any): void {
        let id = "hex";
        if (this.x < 100 && this.y < 100) {
            id += `${this.x}${this.y}`;
        } else {
            id += `${this.x}.${this.y}`;
        }
        const points = HEX_CORNERS.map((corner) => {
            const pixels = this.pixels(corner[0], corner[1]);
            return `${pixels[0].toFixed(1)},${pixels[1].toFixed(1)}`;
        }).join(" ");

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
        const pixels = this.pixels(0, DY * 0.4);
        const gEl = svgEl.createSvg("g");

        const glowEl = gEl.createSvg("text", {
            attr: {
                "text-anchor": "middle",
                x: pixels[0].toFixed(1),
                y: pixels[1].toFixed(1),
                ...attributes,
                ...glowAttributes,
            },
        });
        glowEl.textContent = this.label;

        const labelEl = gEl.createSvg("text", {
            attr: {
                "text-anchor": "middle",
                x: pixels[0].toFixed(1),
                y: pixels[1].toFixed(1),
                ...attributes,
            },
        });
        labelEl.textContent = this.label;
    }
}

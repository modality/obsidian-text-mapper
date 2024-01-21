import { SVGElement } from "./constants";
import { Point, Orientation } from "./orientation";
import { NamespaceFunction } from "./constants";

export class Region {
    x: number;
    y: number;
    types: string[];
    label: string;
    size: string;
    id: string;
    namespace: NamespaceFunction;

    constructor(namespace: NamespaceFunction) {
        this.types = [];
        this.namespace = namespace;
    }

    pixels(orientation: Orientation, addX: number, addY: number): number[] {
        const pix = orientation.pixels(new Point(this.x, this.y), addX, addY);
        return [pix.x, pix.y];
    }

    svg(svgEl: SVGElement, orientation: Orientation, types: string[]): void {
        const pix = orientation.pixels(new Point(this.x, this.y));
        for (const type of this.types) {
            if (!types.includes(type)) {
                continue;
            }
            const namespaced = this.namespace(type);
            svgEl.createSvg("use", {
                attr: {
                    x: pix.x.toFixed(1),
                    y: pix.y.toFixed(1),
                    href: `#${namespaced}`,
                },
            });
        }
    }

    svgCoordinates(
        svgEl: SVGElement,
        orientation: Orientation,
        textAttributes: any,
        coordinatesFormat: string
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

        const xStr = this.x.toString().padStart(2, "0");
        const yStr = this.y.toString().padStart(2, "0");

        const content = coordinatesFormat
            .replace("{X}", xStr)
            .replace("{Y}", yStr);

        coordEl.textContent = content;
    }

    svgRegion(
        svgEl: SVGElement,
        orientation: Orientation,
        attributes: any
    ): void {
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
                id: this.namespace(this.id),
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

        // Computing the label and link
        const textContent =
            this.computeLinkAndLabel(this.label).length > 1
                ? this.computeLinkAndLabel(this.label)[1]
                : this.computeLinkAndLabel(this.label)[0];
        const linkContent = this.computeLinkAndLabel(this.label)[0];

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
        glowEl.textContent = textContent;

        //Only create a link if there is one.
        if (textContent !== linkContent) {
            //Add in clickable link for Obsidian
            const labelLinkEl = gEl.createSvg("a", {
                attr: {
                    "data-tooltip-position": "top",
                    "aria-label": linkContent,
                    href: linkContent,
                    "data-href": linkContent,
                    class: "internal-link",
                    target: "_blank",
                    rel: "noopener",
                },
            });

            const labelEl = labelLinkEl.createSvg("text", {
                attr: {
                    "text-anchor": "middle",
                    x: pix.x.toFixed(1),
                    y: pix.y.toFixed(1),
                    ...attributes,
                },
            });

            labelEl.textContent = textContent;
        } else {
            const labelEl = gEl.createSvg("text", {
                attr: {
                    "text-anchor": "middle",
                    x: pix.x.toFixed(1),
                    y: pix.y.toFixed(1),
                    ...attributes,
                },
            });

            labelEl.textContent = textContent;
        }
    }

    computeLinkAndLabel(label: string): [string, string] {
        let link = label;
        let display = label;
        if (label.includes("|")) {
            const parts = label.split("|");
            link = parts[0];
            display = parts[1];
        }
        return [link, display];
    }
}

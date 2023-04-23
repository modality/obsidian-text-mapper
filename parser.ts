import {
    ATTRIBUTES_REGEX,
    PATH_ATTRIBUTES_REGEX,
    PATH_REGEX,
    XML_REGEX,
    TEXT_REGEX,
    GLOW_REGEX,
    LABEL_REGEX,
    HEX_REGEX,
    HEX_LABEL_REGEX,
    SPLINE_REGEX,
    SPLINE_POINT_REGEX,
    DX,
    DY,
    HEX_CORNERS,
} from "./constants";

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

    svg(): string {
        let data = "";
        const pixels = this.pixels(0, 0);
        for (const type of this.types) {
            data += `<use x="${pixels[0].toFixed(1)}" y="${pixels[1].toFixed(
                1
            )}" xlink:href="#${type}" />\n`;
        }
        return data;
    }

    svgCoordinates(textAttributes: string): string {
        let data = `<text text-anchor="middle"`;
        const pixels = this.pixels(0, -DY * 0.4);
        data += ` x="${pixels[0].toFixed(1)}" y="${pixels[1].toFixed(1)}" `;
        data += textAttributes;
        data += ">";
        // TODO
        data += `${this.x}.${this.y}`;
        data += `</text>`;
        return data;
    }

    svgRegion(attributes: string): string {
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
        return `<polygon id="${id}" ${attributes} points="${points}" />`;
    }

    svgLabel(labelAttributes: string, glowAttributes: string): string {
        let attributes = labelAttributes;
        if (this.label === undefined) {
            return "";
        }
        if (this.size !== undefined) {
            attributes += ` font-size="${this.size}"`;
        }
        const pixels = this.pixels(0, DY * 0.4);
        const pixelAttrs = `x="${pixels[0].toFixed(1)}" y="${pixels[1].toFixed(
            1
        )}"`;
        let data = "<g>";
        data += `<text text-anchor="middle" ${pixelAttrs} ${attributes} ${glowAttributes}>${this.label}</text>`;
        data += `<text text-anchor="middle" ${pixelAttrs} ${attributes}>${this.label}</text>`;
        data += "</g>\n";
        return data;
    }
}

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

    svg(): string {
        return "";
    }
    svgLabel(): string {
        return "";
    }
}

// https://alexschroeder.ch/cgit/text-mapper/tree/lib/Game/TextMapper/Mapper.pm
export class TextMapperParser {
    regions: Region[]; // ' => sub { [] };
    attributes: any; // ' => sub { {} };
    defs: string[]; // ' => sub { [] };
    path: any; // ' => sub { {} };
    splines: Spline[]; // ' => sub { [] };
    things: Region[]; // ' => sub { [] };
    pathAttributes: any; // ' => sub { {} };
    textAttributes: string;
    glowAttributes: string;
    labelAttributes: string;
    // messages: string[]; // ' => sub { [] };

    constructor() {
        this.regions = [];
        this.attributes = {};
        this.defs = [];
        this.path = {};
        this.splines = [];
        this.things = [];
        this.pathAttributes = {};
        this.textAttributes = "";
        this.glowAttributes = "";
        this.labelAttributes = "";
    }

    process(lines: string[]) {
        let lineId = 0;
        for (const line of lines) {
            if (line.startsWith("#")) {
                continue;
            }
            if (HEX_REGEX.test(line)) {
                // hex
                const match = line.match(HEX_REGEX);
                const region = this.makeRegion(
                    match[1],
                    match[2],
                    match[3] || "00"
                );
                let rest = match[4];
                while (HEX_LABEL_REGEX.test(rest)) {
                    const labelMatch = rest.match(HEX_LABEL_REGEX);
                    region.label = labelMatch[1];
                    region.size = labelMatch[2];
                    rest = rest.replace(HEX_LABEL_REGEX, "");
                }
                const types = rest.split(/\s+/);
                region.types = types;
                this.regions.push(region);
                this.things.push(region);
            } else if (SPLINE_REGEX.test(line)) {
                // path
                const match = line.match(SPLINE_REGEX);
                const spline = this.makeSpline();
                let splinePath = match[1];
                spline.types = match[2];
                spline.label = match[3];
                spline.side = match[4];
                spline.start = match[5];
                spline.id = "line" + lineId++;
                for (const pointStr of splinePath.split("-")) {
                    const pointMatch = pointStr.match(SPLINE_POINT_REGEX);
                    spline.addPoint(pointMatch[1], pointMatch[2]);
                }
                this.splines.push(spline);
            } else if (ATTRIBUTES_REGEX.test(line)) {
                const match = line.match(ATTRIBUTES_REGEX);
                this.attributes[match[1]] = match[2];
            } else if (XML_REGEX.test(line)) {
                const match = line.match(XML_REGEX);
                this.def(match[1]);
            } else if (PATH_ATTRIBUTES_REGEX.test(line)) {
                const match = line.match(PATH_ATTRIBUTES_REGEX);
                this.pathAttributes[match[1]] = match[2];
            } else if (PATH_REGEX.test(line)) {
                const match = line.match(PATH_REGEX);
                this.path[match[1]] = match[2];
            } else if (TEXT_REGEX.test(line)) {
                const match = line.match(TEXT_REGEX);
                this.textAttributes = match[1];
            } else if (GLOW_REGEX.test(line)) {
                const match = line.match(GLOW_REGEX);
                this.glowAttributes = match[1];
            } else if (LABEL_REGEX.test(line)) {
                const match = line.match(LABEL_REGEX);
                this.labelAttributes = match[1];
            }
        }
    }

    def(what: string) {
        const svg = what.replace(/>\s+</g, "><");
        this.defs.push(svg);
    }

    makeRegion(x: string, y: string, z: string): Region {
        const region = new Region();
        region.x = parseInt(x);
        region.y = parseInt(y);
        return region;
    }

    makeSpline(): Spline {
        return new Spline();
    }

    viewbox(minx: number, miny: number, maxx: number, maxy: number): number[] {
        return [
            Math.floor((minx * DX * 3) / 2 - DX - 60),
            Math.floor((miny - 1.5) * DY),
            Math.floor((maxx * DX * 3) / 2 + DX + 60),
            Math.floor((maxy + 1) * DY),
        ];
    }

    shape(svgEl: SVGElement, attributes: string) {
        const points = HEX_CORNERS.map((corner) => {
            return `${corner[0].toFixed(1)},${corner[1].toFixed(1)}`;
        }).join(" ");
        const pointsAttr = ` points="${points}"`

        svgEl.createSvg('polygon', { attr: attributes + pointsAttr });
        // return `<polygon ${attributes} points="${points}" />`;
    }

    svgHeader(el: HTMLElement): HTMLElement {
        if (this.regions.length == 0) {
            console.log("log F");
            return el;
        }
        // These are required to calculate the viewBox for the SVG. Min and max X are
        // what you would expect. Min and max Y are different, however, since we want
        // to count all the rows on all the levels, plus an extra separator between
        // them. Thus, min y is the min y of the first level, and max y is the min y of
        // the first level + 1 for every level beyond the first, + all the rows for
        // each level.
        let min_x_overall = undefined;
        let max_x_overall = undefined;
        let min_y_overall = undefined;
        let max_y_overall = undefined;

        for (const region of this.regions) {
            if (min_x_overall == undefined || region.x < min_x_overall) {
                min_x_overall = region.x;
            }
            if (min_y_overall == undefined || region.y < min_y_overall) {
                min_y_overall = region.y;
            }
            if (max_x_overall == undefined || region.x > max_x_overall) {
                max_x_overall = region.x;
            }
            if (max_y_overall == undefined || region.y > max_y_overall) {
                max_y_overall = region.y;
            }
        }

        const [vx1, vy1, vx2, vy2] = this.viewbox(
            min_x_overall,
            min_y_overall,
            max_x_overall,
            max_y_overall
        );
        const width = (vx2 - vx1).toFixed(0);
        const height = (vy2 - vy1).toFixed(0);

        console.log("log D");
        const svgEl: HTMLElement = el.createSvg("svg", {
            attr: {
                viewBox: `${vx1} ${vy1} ${width} ${height}`,
            },
        });

        svgEl.createSvg("rect", {
            attr: {
                x: vx1,
                y: vy1,
                width: width,
                height: height,
                fill: "white",
            },
        });

        return svgEl;
        // header += `<!-- min (${min_x_overall}, ${min_y_overall}), max (${max_x_overall}, ${max_y_overall}) -->\n`;
    }

    svgDefs(svgEl: SVGElement): void {
        // All the definitions are included by default.

        const defsEl = svgEl.createSvg("defs", {});
        defsEl.innerHTML = this.defs.join("\n");

        // collect region types from attributes and paths in case the sets don't overlap
        const types: any = {};
        for (const region of this.regions) {
            for (const rtype of region.types) {
                types[rtype] = 1;
            }
        }
        for (const spline of this.splines) {
            types[spline.types] = 1;
        }

        // now go through them all
        for (const type of Object.keys(types).sort()) {
            const path = this.path[type];
            const attributes = this.attributes[type];
            if (path || attributes) {
                const gEl = defsEl.createSvg("g", { attr: { id: type } });

                // just shapes get a glow such, eg. a house (must come first)
                if (path && !attributes) {
                    gEl.createSvg('path', { attr: this.glowAttributes+` d="${path}"` }

                }
                // region with attributes get a shape (square or hex), eg. plains and grass
                if (attributes) {
                    this.shape(gEl, attributes);
                }
                // and now the attributes themselves the shape itself
                if (path) {
                    gEl.createSvg('path', { attr: this.pathAttributes+` d="${path}"` }
                }
                // close

            }
        }
        // doc += `</defs>\n`;
        // return doc;
    }

    svgBackgrounds(): string {
        let doc = `<g id="backgrounds">\n`;
        for (const thing of this.things) {
            doc += thing.svg();
            // should KEEP this mapper's attributes
        }
        doc += `</g>\n`;
        return doc;
    }

    svgLines(): string {
        let doc = `<g id="lines">\n`;
        for (const spline of this.splines) {
            doc += spline.svg();
        }
        doc += `</g>\n`;
        return doc;
    }

    svgThings(): string {
        let doc = `<g id="things">\n`;
        for (const thing of this.things) {
            doc += thing.svg();
            // should DROP this mapper's attributes
        }
        doc += `</g>\n`;
        return doc;
    }

    svgCoordinates(): string {
        let doc = `<g id="things">\n`;
        for (const region of this.regions) {
            doc += region.svgCoordinates(this.textAttributes);
        }
        doc += `</g>\n`;
        return doc;
    }

    svgRegions(): string {
        let doc = `<g id="regions">\n`;
        const attributes = this.attributes["default"] || `fill="none"`;
        for (const region of this.regions) {
            doc += region.svgRegion(attributes);
        }
        doc += `</g>\n`;
        return doc;
    }

    svgLineLabels(): string {
        let doc = `<g id="line_labels">\n`;
        for (const spline of this.splines) {
            doc += spline.svgLabel();
        }
        doc += `</g>\n`;
        return doc;
    }

    svgLabels(): string {
        let doc = `<g id="labels">\n`;
        for (const region of this.regions) {
            doc += region.svgLabel(this.labelAttributes, this.glowAttributes);
        }
        doc += `</g>\n`;
        return doc;
    }

    svg(el: HTMLElement) {
        const svgEl = this.svgHeader(el);
        this.svgDefs(svgEl);
        this.svgBackgrounds(svgEl);
        this.svgLines(svgEl);
        this.svgThings(svgEl);
        this.svgCoordinates(svgEl);
        this.svgRegions(svgEl);
        this.svgLineLabels(svgEl);
        this.svgLabels(svgEl);
        return svgEl;
    }
}

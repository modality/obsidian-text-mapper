import {
    ATTRIBUTES_REGEX,
    PATH_ATTRIBUTES_REGEX,
    OPTION_REGEX,
    PATH_REGEX,
    XML_REGEX,
    TEXT_REGEX,
    GLOW_REGEX,
    LABEL_REGEX,
    HEX_REGEX,
    HEX_LABEL_REGEX,
    SPLINE_REGEX,
    SPLINE_ELEMENT_SPLIT_REGEX,
    SPLINE_POINT_REGEX,
    ATTRIBUTE_MAP_REGEX,
    SVGElement,
} from "./constants";
import { Point, Orientation } from "./orientation";
import { Region } from "./region";
import { Spline } from "./spline";

// https://alexschroeder.ch/cgit/text-mapper/tree/lib/Game/TextMapper/Mapper.pm
export class TextMapperParser {
    options: any;
    regions: Region[]; // ' => sub { [] };
    attributes: any; // ' => sub { {} };
    defs: string[]; // ' => sub { [] };
    path: any; // ' => sub { {} };
    splines: Spline[]; // ' => sub { [] };
    pathAttributes: any; // ' => sub { {} };
    textAttributes: any;
    glowAttributes: any;
    labelAttributes: any;
    orientation: Orientation;
    // messages: string[]; // ' => sub { [] };

    constructor() {
        this.options = {
            horizontal: false,
            "coordinates-format": "{X}{Y}",
            "swap-even-odd": false,
        };
        this.regions = [];
        this.attributes = {};
        this.defs = [];
        this.path = {};
        this.splines = [];
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
                const region = this.parseRegion(line);
                this.regions.push(region);
            } else if (SPLINE_REGEX.test(line)) {
                const spline = this.parsePath(line, lineId++);
                this.splines.push(spline);
            } else if (ATTRIBUTES_REGEX.test(line)) {
                const match = line.match(ATTRIBUTES_REGEX);
                this.attributes[match[1]] = this.parseAttributes(match[2]);
            } else if (XML_REGEX.test(line)) {
                const match = line.match(XML_REGEX);
                this.def(match[1]);
            } else if (PATH_ATTRIBUTES_REGEX.test(line)) {
                const match = line.match(PATH_ATTRIBUTES_REGEX);
                this.pathAttributes[match[1]] = this.parseAttributes(match[2]);
            } else if (PATH_REGEX.test(line)) {
                const match = line.match(PATH_REGEX);
                this.path[match[1]] = match[2];
            } else if (TEXT_REGEX.test(line)) {
                const match = line.match(TEXT_REGEX);
                this.textAttributes = this.parseAttributes(match[1]);
            } else if (GLOW_REGEX.test(line)) {
                const match = line.match(GLOW_REGEX);
                this.glowAttributes = this.parseAttributes(match[1]);
            } else if (LABEL_REGEX.test(line)) {
                const match = line.match(LABEL_REGEX);
                this.labelAttributes = this.parseAttributes(match[1]);
            } else if (OPTION_REGEX.test(line)) {
                const match = line.match(OPTION_REGEX);
                const opt = this.parseOption(match[1]);
                if (opt.valid) {
                    this.options[opt.key] = opt.value;
                }
            }
        }

        if (this.options.horizontal) {
            this.orientation = new Orientation(
                false,
                this.options["swap-even-odd"]
            );
        } else {
            this.orientation = new Orientation(
                true,
                this.options["swap-even-odd"]
            );
        }
    }

    parseRegion(line: string) {
        // hex
        const match = line.match(HEX_REGEX);
        const region = this.makeRegion(match[1], match[2], match[3] || "00");
        let rest = match[4];
        while (HEX_LABEL_REGEX.test(rest)) {
            const labelMatch = rest.match(HEX_LABEL_REGEX);
            region.label = labelMatch[1];
            region.size = labelMatch[2];
            rest = rest.replace(HEX_LABEL_REGEX, "");
        }
        const types = rest.split(/\s+/).filter((t) => t.length > 0);
        region.types = types;
        return region;
    }

    parsePath(line: string, lineId: number) {
        // path
        const match = line.match(SPLINE_REGEX);
        const spline = this.makeSpline();
        let splinePath = match[1];
        spline.types = match[2];
        spline.label = match[3];
        spline.side = match[4];
        spline.start = match[5];
        spline.id = "line" + lineId;

        let rest = line;
        while (true) {
            let segment: string;
            [segment, rest] = this.splitPathSegments(rest);

            if (segment === null) {
                break;
            }
            const pointMatch = segment.match(SPLINE_POINT_REGEX);
            spline.addPoint(pointMatch[1], pointMatch[2]);
        }

        return spline;
    }

    private splitPathSegments(splinePath: string): [string, string] {
        let match = splinePath.match(SPLINE_ELEMENT_SPLIT_REGEX);

        if (match === null) {
            return [null, splinePath];
        }

        return [match[1], match[2]];
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

    parseAttributes(attrs: string): any {
        const output: any = {};
        let matches;
        while ((matches = ATTRIBUTE_MAP_REGEX.exec(attrs))) {
            output[matches[1]] = matches[2];
        }
        return output;
    }

    parseOption(optionStr: string): any {
        const option: any = {
            valid: false,
            key: "",
            value: "",
        };
        const tokens = optionStr.split(" ");
        if (tokens.length < 1) {
            return option;
        }

        option.key = tokens[0];

        if (option.key === "horizontal" || option.key === "swap-even-odd") {
            option.valid = true;
            option.value = true;
        } else if (option.key === "coordinates-format") {
            option.valid = true;
            option.value = tokens.slice(1).join(" ");
        }
        return option;
    }

    shape(svgEl: SVGElement, attributes: any) {
        const points = this.orientation
            .hexCorners()
            .map((corner: Point) => corner.toString())
            .join(" ");
        svgEl.createSvg("polygon", {
            attr: {
                ...attributes,
                points,
            },
        });
        // return `<polygon ${attributes} points="${points}" />`;
    }

    svgHeader(el: HTMLElement): SVGElement {
        if (this.regions.length == 0) {
            // @ts-ignore
            return el.createSvg("svg");
        }

        const [vx1, vy1, vx2, vy2] = this.orientation.viewbox(this.regions);
        const width = (vx2 - vx1).toFixed(0);
        const height = (vy2 - vy1).toFixed(0);

        // @ts-ignore
        const svgEl: SVGElement = el.createSvg("svg", {
            attr: {
                "xmlns:xlink": "http://www.w3.org/1999/xlink",
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
    }

    svgDefs(svgEl: SVGElement): void {
        // All the definitions are included by default.
        const defsEl = svgEl.createSvg("defs");
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
                    gEl.createSvg("path", {
                        attr: {
                            ...this.glowAttributes,
                            d: path,
                        },
                    });
                }
                // region with attributes get a shape (square or hex), eg. plains and grass
                if (attributes) {
                    this.shape(gEl, attributes);
                }
                // and now the attributes themselves the shape itself
                if (path) {
                    gEl.createSvg("path", {
                        attr: {
                            ...this.pathAttributes,
                            d: path,
                        },
                    });
                }
            }
        }
    }

    svgBackgrounds(svgEl: SVGElement): void {
        const bgEl = svgEl.createSvg("g", { attr: { id: "backgrounds" } });
        const whitelist = Object.keys(this.attributes);
        for (const region of this.regions) {
            region.svg(bgEl, this.orientation, whitelist);
        }
    }

    svgLines(svgEl: SVGElement): void {
        const splinesEl = svgEl.createSvg("g", { attr: { id: "lines" } });
        for (const spline of this.splines) {
            spline.svg(splinesEl, this.orientation, this.pathAttributes);
        }
    }

    svgThings(svgEl: SVGElement): void {
        const thingsEl = svgEl.createSvg("g", { attr: { id: "things" } });
        const blacklist = Object.keys(this.attributes);
        for (const region of this.regions) {
            const filtered = region.types.filter((t) => !blacklist.includes(t));
            region.svg(thingsEl, this.orientation, filtered);
        }
    }

    svgCoordinates(svgEl: SVGElement): void {
        const coordsEl = svgEl.createSvg("g", { attr: { id: "coordinates" } });
        for (const region of this.regions) {
            region.svgCoordinates(
                coordsEl,
                this.orientation,
                this.textAttributes,
                this.options["coordinates-format"]
            );
        }
    }

    svgRegions(svgEl: SVGElement): void {
        const regionsEl = svgEl.createSvg("g", { attr: { id: "regions" } });
        const attributes = this.attributes["default"];
        for (const region of this.regions) {
            region.svgRegion(regionsEl, this.orientation, attributes);
        }
    }

    svgLineLabels(svgEl: SVGElement): void {
        const labelsEl = svgEl.createSvg("g", { attr: { id: "line_labels" } });
        for (const spline of this.splines) {
            spline.svgLabel(
                labelsEl,
                this.labelAttributes,
                this.glowAttributes
            );
        }
    }

    svgLabels(svgEl: SVGElement): void {
        const labelsEl = svgEl.createSvg("g", { attr: { id: "labels" } });
        for (const region of this.regions) {
            region.svgLabel(
                labelsEl,
                this.orientation,
                this.labelAttributes,
                this.glowAttributes
            );
        }
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

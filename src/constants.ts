export const ATTRIBUTES_REGEX = /^(\S+)\s+attributes\s+(.*)/;
export const PATH_ATTRIBUTES_REGEX = /^(\S+)\s+path\s+attributes\s+(.*)/;
export const PATH_REGEX = /^(\S+)\s+path\s+(.*)/;
export const XML_REGEX = /^(<.*>)/;
export const TEXT_REGEX = /^text\s+(.*)/;
export const GLOW_REGEX = /^glow\s+(.*)/;
export const LABEL_REGEX = /^label\s+(.*)/;
export const OPTION_REGEX = /^option\s+(.*)/;
export const HEX_REGEX = /^(-?\d\d)(-?\d\d)(\d\d)?\s+(.*)/;
export const HEX_LABEL_REGEX = /["]([^"]+)["]\s*(\d+)?/;
export const SPLINE_REGEX =
    /^(-?\d\d-?\d\d(?:\d\d)?(?:--?\d\d-?\d\d(?:\d\d)?)+)\s+(\S+)\s*(?:["“](.+)["”])?\s*(left|right)?\s*(\d+%)?/;
export const SPLINE_ELEMENT_SPLIT_REGEX = /^(-?\d\d-?\d\d)-?(.* )/;
export const SPLINE_POINT_REGEX = /(-?\d\d)(-?\d\d)/;
export const ATTRIBUTE_MAP_REGEX = /(\S+)="([^"]+)"/g;
export const SVG_CHOMP_WHITESPACE_REGEX = /(>)(\s+)(<)/g;
export const SVG_ID_REGEX = /(id=")(\S+)(")/g;
export const SVG_HREF_REGEX = /(xlink:href="#)(\S+)(")/g;

export interface SVGElement {
    createSvg(tag: string, options?: any): SVGElement;
    innerHTML: string;
    textContent: string;
}

export type NamespaceFunction = {
    (what: string): string;
};

import { Region } from "./region";

export class Point {
    x: number;
    y: number;

    constructor(x: number, y: number) {
        this.x = x;
        this.y = y;
    }

    toString(): string {
        return `${this.x.toFixed(1)},${this.y.toFixed(1)}`;
    }

    eq(pt: Point): boolean {
        return this.x == pt.x && this.y == pt.y;
    }
}

export class Orientation {
    flatTop: boolean;
    swapEvenOdd: boolean;
    dy: number;
    dx: number;
    labelOffset: number;

    constructor(flatTop: boolean = true, swapEvenOdd: boolean = false) {
        this.flatTop = flatTop;
        this.swapEvenOdd = swapEvenOdd;
        if (this.flatTop) {
            this.dx = 100;
            this.dy = (100 * Math.sqrt(3)) / 2;
            this.labelOffset = 0.8;
        } else {
            this.dx = (100 * Math.sqrt(3)) / 2;
            this.dy = 100;
            this.labelOffset = 0.58;
        }
    }

    viewbox(regions: Region[]): number[] {
        const xMargin = 60 + this.dx;
        const yMargin = 60 + this.dy;
        let min_x_overall = undefined;
        let max_x_overall = undefined;
        let min_y_overall = undefined;
        let max_y_overall = undefined;

        const pixels: Point[] = regions.map((r) =>
            this.pixels(new Point(r.x, r.y), 0, 0)
        );

        for (const pixel of pixels) {
            if (min_x_overall == undefined || pixel.x < min_x_overall) {
                min_x_overall = pixel.x;
            }
            if (min_y_overall == undefined || pixel.y < min_y_overall) {
                min_y_overall = pixel.y;
            }
            if (max_x_overall == undefined || pixel.x > max_x_overall) {
                max_x_overall = pixel.x;
            }
            if (max_y_overall == undefined || pixel.y > max_y_overall) {
                max_y_overall = pixel.y;
            }
        }

        return [
            min_x_overall - xMargin,
            min_y_overall - yMargin,
            max_x_overall + xMargin,
            max_y_overall + yMargin,
        ];
    }

    hexCorners(): Point[] {
        if (this.flatTop) {
            return [
                new Point(-this.dx, 0),
                new Point(-this.dx / 2, this.dy),
                new Point(this.dx / 2, this.dy),
                new Point(this.dx, 0),
                new Point(this.dx / 2, -this.dy),
                new Point(-this.dx / 2, -this.dy),
            ];
        } else {
            return [
                new Point(0, -this.dy),
                new Point(this.dx, -this.dy / 2),
                new Point(this.dx, this.dy / 2),
                new Point(0, this.dy),
                new Point(-this.dx, this.dy / 2),
                new Point(-this.dx, -this.dy / 2),
            ];
        }
    }

    pixels(pt: Point, offsetX: number = 0, offsetY: number = 0): Point {
        if (this.flatTop) {
            const evenOdd = (this.swapEvenOdd ? 1 : 0) * (pt.x % 2);
            const x = (pt.x * this.dx * 3) / 2 + offsetX;
            const y =
                (pt.y + evenOdd) * this.dy * 2 -
                (Math.abs(pt.x) % 2) * this.dy +
                offsetY;
            return new Point(x, y);
        } else {
            const evenOdd = (this.swapEvenOdd ? 1 : 0) * (pt.y % 2);
            const x =
                (pt.x + evenOdd) * this.dx * 2 -
                (Math.abs(pt.y) % 2) * this.dx +
                offsetX;
            const y = (pt.y * this.dy * 3) / 2 + offsetY;
            return new Point(x, y);
        }
    }
}

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
    dy: number;
    dx: number;
    labelOffset: number;

    constructor(flatTop: boolean = true) {
        this.flatTop = flatTop;
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

    viewbox(minx: number, miny: number, maxx: number, maxy: number): number[] {
        if (this.flatTop) {
            return [
                Math.floor((minx * this.dx * 3) / 2 - this.dx - 60),
                Math.floor((miny - 1.5) * this.dy * 2),
                Math.floor((maxx * this.dx * 3) / 2 + this.dx + 60),
                Math.floor((maxy + 1) * this.dy * 2),
            ];
        } else {
            return [
                Math.floor((minx - 1.5) * this.dx * 2),
                Math.floor((miny * this.dy * 3) / 2 - this.dy - 60),
                Math.floor((maxx + 1) * this.dx * 2),
                Math.floor((maxy * this.dy * 3) / 2 + this.dy + 60),
            ];
        }
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
            const x = (pt.x * this.dx * 3) / 2 + offsetX;
            const y = pt.y * this.dy * 2 - (pt.x % 2) * this.dy + offsetY;
            return new Point(x, y);
        } else {
            const x = pt.x * this.dx * 2 - (pt.y % 2) * this.dx + offsetX;
            const y = (pt.y * this.dy * 3) / 2 + offsetY;
            return new Point(x, y);
        }
    }
}

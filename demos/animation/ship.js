/**
 * User: Alexander
 * Date: 22.04.12
 */
//create circles
function ShipShape(options) {
    this.alias = null;
    this._x = 0;
    this._y = 0;
    this.width = 1;
    this.height = 1;

    this.angle = 0;
    this.image = null;
    this.sprites = null;
    this.align = null;

    this.speed = 10;
    this.forwardSpeed = 12;
    this.maxForwardSpeed = 25;
    this.backSpeed = 7;


    if (options._x !== undefined) {
        this._x = options._x;
    }
    if (options._y !== undefined) {
        this._y = options._y;
    }

    if (options.angle !== undefined) {
        this.angle = options.angle;
    }

    if (options.alias !== undefined) {
        this.alias = options.alias;
    }

    this.image = options.image;
    if (options.height === undefined) {
        this.height = this.image.height;
    } else {
        this.height = options.height;
    }
    if (options.width === undefined) {
        this.width = this.image.width;
    } else {
        this.width = options.width;
    }
    if (options.align !== undefined) {
        this.align = options.align;
    }
    if (options.orginWidth === undefined) {
        this.orginWidth = this.image.width;
    } else {
        this.orginWidth = options.orginWidth;
    }
    if (options.orginHeight === undefined) {
        this.orginHeight = this.image.height;
    } else {
        this.orginHeight = options.orginHeight;
    }
    if (options.sprites !== undefined) {
        this.sprites = options.sprites;
    }


    this.draw = function(context) {

        if (context === xCanvas.gctx) {
            context.fillStyle = 'black'; // always want black for the ghost canvas
        } else {
            context.fillStyle = this.fill;
        }

        // We can skip the drawing of elements that have moved off the screen:
        if (this._x > xCanvas.canvasSize.width || this._y > xCanvas.canvasSize.height) return;
        if (this._x + this.width < 0 || this._y + this.height < 0) return;

        //draw

        context.save();
        context.translate(this._x + this.width / 2, this._y + this.height / 2);
        context.rotate(xCanvas.toRadians(this.angle));
        context.translate(-(this._x + this.width / 2), -(this._y + this.height / 2));


        if (this.align !== null) {
            context.drawImage(
                this.image,
                this.align,
                0,
                this.orginWidth,
                this.orginHeight,
                this._x,
                this._y,
                this.width,
                this.height
            );
            if (this.sprites) {
                if (this.align + this.orginWidth >= this.sprites * this.orginWidth) {
                    this.align = 0;
                } else {
                    this.align += this.orginWidth;
                }
            }
        } else {
            context.drawImage(this.image, this._x, this._y, this.width, this.height);
        }
        context.restore();
    }
}
ShipShape.prototype = {
    set x (value) {
        if (value + this.width <= xCanvas.canvasSize.width && value >= 0){
            this._x = value;
        }
    },
    get x() {
        return this._x;
    },
    set y(value) {
        if (value + this.height <= xCanvas.canvasSize.height && value >= 0) {
            this._y = value;
        }
    },
    get y() {
        return this._y;
    }
};
/**
 * User: Alexander
 * Date: 06.11.11
 * Time: 18:59
 */
    var Ship = atom.Class({

        Extends : LibCanvas.Behaviors.Drawable,
        Implements: [
            atom.Class.Events,
            LibCanvas.Invoker.AutoChoose
        ],

        animation: null,

        initialize : function (position, angle, canvasXY) {
            this._maxX = canvasXY[0];
            this._maxY = canvasXY[1];
            this.spriteSize = 80;
            this._x = position[0];
            this._y = position[1];
            this._angle = angle;
            this._moving = true;
            this._playing = true;
            this._structure = 100;
            this._boom = false;
            this._shipType = 'feiws';

            this.addEvent('libcanvasSet', function () {
                this.animation = new LibCanvas.Animation.Sprite();

                this.destruction = new LibCanvas.Animation.Sprite()
                .addSprites(this.libcanvas.getImage('des'), 144);
            });
        },

        get structure () {
            return this._structure;
        },
        set structure (value) {
            this._structure = value;
        },
        get angle () {
            return this._angle;
        },
        set angle (value) {
            if (this._moving) {
                this._angle = value;
            }
        },
        get x () {
            return this._x;
        },
        set x (value) {
            if (this._moving) {
                if ((value + this.spriteSize/2) <= this._maxX && value >= this.spriteSize/2){
                    this._x = value;
                }
            }
        },
        get y () {
            return this._y;
        },
        set y (value) {
            if (this._moving) {
                if ((value + this.spriteSize/2) <= this._maxY && value >= this.spriteSize/2){
                    this._y = value;
                }
            }
        },
        set moving (value) {
            this._moving = value;
        },

        set playing (value) {
            this._playing = value;
        },
        set boom (value) {
            this._boom = value;
        },
        set shipType (value) {
            this._shipType = value;
        },

        draw : function () {
            if (!this._playing){
                return;
            }
            if (this._boom ) {
                this._playing = true;
                this.destruction.run({
                    line : Array.range(0,51),
                    delay: 40,
                    loop : false
                }).addEvent('stop', function () {
                    this._boom = false;
                    this._playing = false;
                    //this.libcanvas.rmElement(this);
                    this.destruction.stop(true);

                }.bind(this));
                this.destruction.sprite && this.libcanvas.ctx.drawImage({
                        image : this.destruction.sprite,
                        center: [this._x, this._y]//this._pos
                    });
                this.libcanvas.getAudio('explosion').play();

            } else {
                this.animation.addSprites(this.libcanvas.getImage(this._shipType), 128)
                    .run({
                        line : Array.range(0,49),
                        delay: 40,
                        loop : true
                    }) && this.libcanvas.ctx.drawImage({
                    image : this.animation.sprite,
                    //from: [this._x, this._y],
                    draw: [this._x-(this.spriteSize/2),this._y-(this.spriteSize/2),this.spriteSize,this.spriteSize],
                    //center: [this._x, this._y],
                    angle: (this._angle).degree()
                });
            }
        }
    });
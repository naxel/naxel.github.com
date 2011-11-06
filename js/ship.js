/**
 * User: Alexander
 * Date: 06.11.11
 * Time: 18:59
 */
    var Ship = atom.Class({
        position : null,

        Extends : LibCanvas.Behaviors.Drawable,
        Implements: [
            atom.Class.Events,
            LibCanvas.Invoker.AutoChoose
        ],

        animation: null,

        initialize : function (position, angle, canvasXY) {
            this._maxX = canvasXY[0];
            this._maxY = canvasXY[1];
            this.spriteSize = 128;
            this._x = position[0];
            this._y = position[1];
            this.position = position;
            this._angle = angle;
            this._moving = true;
            this._playing = true;
            this._structure = 100;
            this._boom = false;


            this.addEvent('libcanvasSet', function () {
                this.animation = new LibCanvas.Animation.Sprite()
                    .addSprites(this.libcanvas.getImage('test'), this.spriteSize)
                    .run({
                        line : Array.range(0,96),
                        delay: 40,
                        loop : true
                    });
                this.destruction = new LibCanvas.Animation.Sprite()
                .addSprites(this.libcanvas.getImage('des'), 144);

                //this.libcanvas.getAudio('explosion').playNext();
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

        draw : function () {
            if(!this._playing){
                return;
            }
            if (this._boom ) {

                this.destruction.run({
                    line : Array.range(0,51),
                    delay: 40,
                    //repeat: 1,
                    loop : false
                }).addEvent('stop', function () {
                    this._boom = false;
                    //this.libcanvas.rmElement(this);
                    this.destruction.stop(true);

                }.bind(this));
                this.destruction.sprite && this.libcanvas.ctx.drawImage({
                        image : this.destruction.sprite,
                        center: [this._x, this._y]//this._pos
                    });
                this.libcanvas.getAudio('explosion').play();

            } else {
                this.animation && this.libcanvas.ctx.drawImage({
                    image : this.animation.sprite,
                    //from: this.position,
                    //from: [this._x, this._y],
                    center: [this._x, this._y],
                    angle: (this._angle).degree()//this._angle
                });
            }

        }
    });
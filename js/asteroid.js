/**
 * User: Alexander
 * Date: 06.11.11
 * Time: 18:30
 */


    var Asteroid = atom.Class({
        position : null,

        Extends : LibCanvas.Scene.Element,
        Implements: [
            Draggable, Clickable
        ],
        animation: null,


        initialize : function (canvasSize) {

            this._endPos = [0, canvasSize.y];
            this._speed = 5;
            this._fly = false;
            this._pos = [canvasSize.x, 0];
            this._dx = this._speed * canvasSize.x / Math.sqrt(canvasSize.x * canvasSize.x + canvasSize.y * canvasSize.y);
            this._dy = this._speed * canvasSize.y / Math.sqrt(canvasSize.x * canvasSize.x + canvasSize.y * canvasSize.y);

            this._type = 'asteroid';

            this.addEvent('libcanvasSet', function () {
                this.animation = new LibCanvas.Animation.Sprite()
                    .addSprites(this.libcanvas.getImage('asteroid'), 48);
                this.destruction = new LibCanvas.Animation.Sprite()
                .addSprites(this.libcanvas.getImage('des'), 144);

            });
        },

        get pos () {
            return this._pos;
        },
        set pos (value) {
            this._pos = value;
        },

        get fly () {
            return this._fly;
        },
        set fly (value) {
            this._fly = value;
        },

        set boom (value) {
            this._boom = value;
        },
        get type () {
            return this._type;
        },
        set type (value) {
            this._type = value;
        },
        get delta () {
            return [this._dx, this._dy];
        },

        isImpact: function (pos) {
            if (pos[0] <= this._pos[0]+48 && pos[0] >= this._pos[0]-48
                    && pos[1] <= this._pos[1]+48 && pos[1] >= this._pos[1]-48){
                return true;
            } else {
                return false;
            }
        },

        draw : function () {

            if (!play || !this.fly){
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
                    this.pos = [Number.random(40, canvasSize.x-40), 0];

                }.bind(this));
                this.destruction.sprite && this.libcanvas.ctx.drawImage({
                        image : this.destruction.sprite,
                        center: this._pos
                    });
                this.libcanvas.getAudio('explosion').play();

            }else{
            	if (this._endPos[0] > this._pos[0] || this._endPos[1] < this._pos[1]){
                    //this._pos = [canvasSize.x, 0];
                    this._pos = [Number.random(40, canvasSize.x-40), 0];
                } else {
                    this.pos[0] -= this._dx;
                    this.pos[1] += this._dy;
                }
                if (this._type == 'asteroid') {
                    if (
                        this.animation.run({
                            line : Array.range(0,99),
                            delay: 40,
                            loop : true
                        }) ) {
                        this.libcanvas.ctx.drawImage({
                            image : this.animation.sprite,
                            center: this._pos
                        });
                    }
                }
            }

        }
    });

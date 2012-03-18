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

            this._type = 'asteroid_11';

            this.addEvent('libcanvasSet', function () {
                this.animation = new LibCanvas.Animation.Sprite()

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

        isImpact: function (pos) {
            if (pos[0] <= this._pos[0]+30 && pos[0] >= this._pos[0]-30
                    && pos[1] <= this._pos[1]+30 && pos[1] >= this._pos[1]-30 && !this._boom) {

                var z = 100;
                if (pos[0] > this._pos[0]) {
                    var x1 = pos[0] - this._pos[0];
                    var xk = 1;
                } else {
                    var x1 = this._pos[0] - pos[0];
                    var xk = -1;
                }

                if (pos[1] > this._pos[1]) {
                    var y1 = pos[1] - this._pos[1];
                    var yk = 1;
                } else {
                    var y1 = this._pos[1] - pos[1];
                    var yk = -1;
                }
                var y = z * y1/Math.sqrt(x1 * x1 + y1 * y1);
                var x = Math.sqrt(z * z - y * y);
                this._boom = true;
                return [x * xk, y * yk];
            } else {
                return false;
            }
        },

        draw : function () {

            if (!play || !this.fly){
                return;
            }
            if (this._boom) {

                this.destruction.run({
                    line : Array.range(0,51),
                    delay: 40,
                    loop : false
                }).addEvent('stop', function () {
                    this._boom = false;
                    //this.libcanvas.rmElement(this);
                    this.destruction.stop(true);
                    this.pos = [Number.random(40, canvasSize.x-40), 0];
                    var ran = Number.random(0, 2);
                    if (ran == 1) {
                         this._type = 'asteroid_11';
                    } else if(ran == 2) {
                         this._type = 'asteroid_12';
                    } else {
                         this._type = 'asteroid_14';
                    }


                }.bind(this));
                this.destruction.sprite && this.libcanvas.ctx.drawImage({
                        image : this.destruction.sprite,
                        center: this._pos
                    });
                this.libcanvas.getAudio('explosion').play();

            } else {
            	if (this._endPos[0] > this._pos[0] || this._endPos[1] < this._pos[1]){
                    //this._pos = [canvasSize.x, 0];
                    this._pos = [Number.random(40, canvasSize.x-40), 0];
                    var ran = Number.random(0, 2);
                    if (ran == 1) {
                         this._type = 'asteroid_11';
                    } else if(ran == 2) {
                         this._type = 'asteroid_12';
                    } else {
                         this._type = 'asteroid_14';
                    }
                } else {
                    this.pos[0] -= this._dx;
                    this.pos[1] += this._dy;
                }
                //if (this._type == 'asteroid') {
                    if (
                        this.animation.addSprites(this.libcanvas.getImage(this._type), 48)
                            .run({
                            line : Array.range(0,80),
                            delay: 40,
                            loop : true
                        }) ) {
                        this.libcanvas.ctx.drawImage({
                            image : this.animation.sprite,
                            center: this._pos
                        });
                    }
                //}
            }
        }
    });

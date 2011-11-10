/**
 * User: Alexander
 * Date: 06.11.11
 * Time: 18:23
 */

    var Trouble = atom.Class({
        position : null,

        Extends : LibCanvas.Scene.Element,
        Implements: [
            Draggable, Clickable
        ],
        animation: null,


        initialize : function (position) {
            this._pos = position;

            //this._boom = false;
            this._type = 'hedgehog';

            this.addEvent('libcanvasSet', function () {
                this.animation = new LibCanvas.Animation.Sprite()
                    .addSprites(this.libcanvas.getImage('hedgehog'), 64);
            });
        },

        get pos () {
            return this._pos;
        },
        set pos (value) {
            this._pos = value;
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

        isTroubled: function (pos) {
            if (pos[0] <= this._pos[0]+50 && pos[0] >= this._pos[0]-50
                    && pos[1] <= this._pos[1]+50 && pos[1] >= this._pos[1]-50){
                return true;
            } else {
                return false;
            }
        },

        draw : function () {
            if (!play){
                return;
            }
            if (this._type == 'hedgehog') {
                if (
                    this.animation.run({
                        line : Array.range(0,319),
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
    });

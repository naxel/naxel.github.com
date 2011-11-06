/**
 * User: Alexander
 * Date: 06.11.11
 * Time: 18:32
 */

    var Dialog = atom.Class({
        Extends : LibCanvas.Scene.Element,
        Implements: [
            Draggable, Clickable
        ],
        initialize: function (canvas, options) {
            //console.log(options.length);
            this._options = options;
            this._displayTv = false;
            this._canvas = this.libcanvas;

            this._proposition = ' Это тестовое сообшение, не несущее ни малейшего смысла.';
            this._proposition += '\n Может приступим, или тебе нужен инструктаж?';

            if (canvas) {
                this._canvas = canvas;
            }

            if (!this._displayTv) {
                this.tv = this._canvas.getImage('dialogBadTv');
            }

            this.image = this._canvas.getImage('dialog');

            this.imgHeight = 450;

            var k = this.image.height / this.imgHeight;

            this.imgWidth = this.image.width / k;

            this.tvHeight = this.tv.height / k;
            this.tvWidth = this.tv.width / k;
            this.tvLeftMargin = 135 / k;
            this.tTopMargin = 10 / k;
            this.shape = new Rectangle(0, 0, this.imgWidth, this.imgHeight);

          //  this.dispatcher = this._canvas.getImage('dispatcher');
            this.dispatcher = new LibCanvas.Animation.Sprite()
            .addSprites(this._canvas.getImage('dispatcher'), 222);


        },
        set proposition (value) {
            this._proposition = value;
        },

        draw: function () {
            this.image
            && this.dispatcher.run({
                line : Array.range(0,9),
                delay: 80,
                repeat: 1,
                loop : true
            })
            && this._canvas.ctx.drawImage({
                image : this.dispatcher.sprite,
                //from : [this.tvLeftMargin, this.tTopMargin],
                draw : [this.tvLeftMargin, this.tTopMargin, this.tvWidth, this.tvHeight]
            })
            /*&& this._canvas.ctx.drawImage({
                image : this.tv,
                //from : [0,0],
                draw : [this.tvLeftMargin, this.tTopMargin, this.tvWidth, this.tvHeight]
            })*/
            && this._canvas.ctx.drawImage({
                image : this.image,
                //from : [0,0],
                draw : [0, 0, this.imgWidth, this.imgHeight]
            })

            && this._canvas.ctx.text({
                text : this._proposition,
                color : '#333333',
                to: [20, 100, this.imgWidth-50, this.imgHeight],
                size : 14,
                style : 'italic',
                //padding : [100, 15],
                align : 'left'
                //wrap : 'no',
            })

        }
    });

    var Answer = atom.Class({
        Extends : LibCanvas.Scene.Element,
        Implements: [
            Draggable, Clickable
        ],
        initialize: function (canvas, options) {
            this._text = options.text;
            this._color = '#333333';
            this._position = options.position;
            this._style = 'italic';

            this._textSize = 12;
            this._shape = new Rectangle(this._position);
            this.shape = this._shape;

            this._display = true;

            this._canvas = this.libcanvas;

            if (canvas) {
                this._canvas = canvas;
            }


        },

        set style (value) {
            this._style = value;
        },

        set textSize (value) {
            this._textSize = value;
        },
        set display (value) {
            this._display = value;
            if (!value) {
                this.shape = new Rectangle(0,0,0,0);
            }
        },


        draw: function () {
            if(this._display){
                this._canvas.ctx.fill(new Rectangle(this._position), '#aac3cb');
                this._canvas.ctx.text({
                        text : this._text,
                        color : this._color,
                        to: this._position,
                        size : this._textSize,
                        style : this._style
                        //padding : [this._paddingTop, 0],
                        //align : 'left',
                        //wrap : 'no',
                    });
            }

        }
    });
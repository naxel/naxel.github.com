/**
 * User: Alexander
 * Date: 28.03.12
 */
var xCanvas = {

    version: '0.0.4.2',

    APPLICATION_ENV: 'development',//'production'//'testing'//'development'

    shapes: [],

    combArray: [],

    selectionHandles: [],

    canvasSize: {
        width: 800,
        height: 600
    },

    canvas: null,
    ctx: null,
    interval: 16,
    animation: false,
    manipulation: null,

    isDrag: false,
    isResizeDrag: false,
    expectResize: -1,

    canvasValid: false,

    mySel: null,
    mySelColor: '#999999',
    mySelWidth: 2,
    mySelBoxColor: '#333333', // New for selection boxes
    mySelBoxSize: 6,

    ghostcanvas: null,
    gctx: null, // fake canvas context

    offsetx: null, offsety: null,

    // Padding and border style widths for mouse offsets
    stylePaddingLeft: null, stylePaddingTop: null, styleBorderLeft: null, styleBorderTop: null,

    offsetX: null,
    offsetY: null,

    //croping canvas
    crop: false,
    isCrop: false,
    myCrop: {
        x: 0,
        y: 0,
        height: 0,
        width: 0
    },

    init: function (id, options, fnc) {

        if (options !== undefined) {
            if (options.width !== undefined) {
                this.canvasSize.width = options.width;
            }
            if (options.height !== undefined) {
                this.canvasSize.height = options.height;
            }
            if (options.interval !== undefined) {
                this.interval = options.interval;
            }
            if (options.animation !== undefined) {
                this.animation = options.animation;
            }
        }


        if (this.APPLICATION_ENV != 'development') {
            this.disableLog(true);
        }

        this.canvas = document.getElementById(id);
        this.canvas.height = this.canvasSize.height;
        this.canvas.width = this.canvasSize.width;
        this.ctx = this.canvas.getContext("2d");

        this.ghostcanvas = document.createElement('canvas');
        this.ghostcanvas.height = this.canvasSize.height;
        this.ghostcanvas.width = this.canvasSize.width;
        this.gctx = this.ghostcanvas.getContext('2d');

        //fixes a problem where double clicking causes text to get selected on the canvas
        this.canvas.onselectstart = function () {
            return false;
        };

        // fixes mouse co-ordinate problems when there's a border or padding
        if (document.defaultView && document.defaultView.getComputedStyle) {
            this.stylePaddingLeft = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingLeft'], 10) || 0;
            this.stylePaddingTop = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['paddingTop'], 10) || 0;
            this.styleBorderLeft = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderLeftWidth'], 10) || 0;
            this.styleBorderTop = parseInt(document.defaultView.getComputedStyle(this.canvas, null)['borderTopWidth'], 10) || 0;
        }

        // set our events. Up and down are for dragging,
        this.canvas.onmousedown = this.mouseDown;
        this.canvas.onmouseup = this.mouseUp;
        this.canvas.onmousemove = this.mouseMove;

        //user init function
        if (fnc !== undefined) {
            fnc.call(this);
        }

        // set up the selection handle boxes
        for (var i = 0; i < 8; i++) {
            var rect = new Shape({});
            this.selectionHandles.push(rect);
        }

        return this;
    },

    run: function() {
        // make drawingLoop() fire every INTERVAL milliseconds
        setInterval(this.drawingLoop, this.interval);
    },
    //disable logging to console
    disableLog: function(disable){
        if (typeof(console) == 'undefined'|| disable == true) {
            console = {
                log: function(message) {},
                info: function(message) {},
                warn: function(message) {},
                error: function(message) {
                    alert(message);
                }
            }
        }
    },

    addShape: function (shape) {
        this.shapes.push(shape);
        this.canvasValid = false;
    },
    //remove selected shape
    removeShape: function (alias) {

        var data = this.shapes;
        var l = this.shapes.length;
        this.shapes = [];
        for (var i = 0; i < l; i++) {
            if (alias !== undefined) {
                if (alias != data[i].alias) {
                    this.shapes.push(data[i]);
                }
            } else {
                if (this.mySel != data[i]) {
                    this.shapes.push(data[i]);
                }
            }

        }
        this.mySel = null;
        this.canvasValid = false;
    },

    removeAllShapes: function () {
        this.shapes = [];
        this.mySel = null;
        this.crop = false;
        this.canvasValid = false;
    },

    //formatting shapes
    alignShapes: function () {
        var position = {
            x: 0,
            y: 0,
            maxY: 0,
            maxX: 0
        };
        var l = this.shapes.length;
        for (var i = 0; i < l; i++) {
            this.shapes[i].x = position.x;
            if (this.shapes[i].height > position.maxY) {
                position.maxY = this.shapes[i].height;
            }
            this.shapes[i].y = position.y;
            position.x += this.shapes[i].width;
        }
        position.maxX = position.x;
        this.mySel = null;
        this.crop = false;
        this.setSizeCanvas(position.maxX, position.maxY);
    },
    //get all shapes
    getShapes: function() {
        return this.shapes;
    },
    //get shape by alias
    getShape: function(alias) {
        var l = this.shapes.length;
        for (var i = 0; i < l; i++) {
            if (this.shapes[i].alias == alias) {
                return this.shapes[i];
            }
        }
    },

    //translate croped canvas
    translateCanvas: function(x,y,width, height) {
        var myX = 0, myY = 0;
        if (width < 0) {
            myX = width + x;
        }else{
            myX = x;
        }
        if (height < 0) {
            myY = height + y;
        } else {
            myY = y;
        }

        var l = xCanvas.shapes.length;
        for (var i = 0; i < l; i++) {
            this.shapes[i].x = this.shapes[i].x - myX;
            this.shapes[i].y = this.shapes[i].y - myY;
        }
        this.crop = false;
        this.setSizeCanvas(Math.abs(width), Math.abs(height));
        return this;
    },

    //set canvas size
    setSizeCanvas: function(width, height) {
        this.canvasSize.height = height;
        this.canvasSize.width = width;
        this.canvas.height = this.canvasSize.height;
        this.canvas.width = this.canvasSize.width;
        this.ghostcanvas.height = this.canvasSize.height;
        this.ghostcanvas.width = this.canvasSize.width;
        this.canvasValid = false;
        return this;
    },
    //set canvas size by canvasSize obj
    refreshCanvasSize: function() {
        this.canvas.height = this.canvasSize.height;
        this.canvas.width = this.canvasSize.width;
        this.ghostcanvas.height = this.canvasSize.height;
        this.ghostcanvas.width = this.canvasSize.width;
        this.canvasValid = false;
        return this;
    },

    //get base64 string by canvas
    getDataURL: function (type) {
        this.mySel = null;
        this.canvasValid = false;
        this.drawingLoop();
        switch (type) {
            case 'jpg':
            case 'jpeg':
                return this.canvas.toDataURL('image/jpeg');
                break;
            case 'png':
            default:
                return this.canvas.toDataURL('image/png');
        }
    },
    //add function to calling in drawing loop
    addFunc: function (fnc) {
        this.manipulation = fnc;
        return this;
    },
    //main drawing loop
    drawingLoop: function () {
        //if not valid canvas or animation type app
        if (xCanvas.canvasValid == false || xCanvas.animation) {

            //caling user function
            if (xCanvas.manipulation) {
                xCanvas.manipulation();
            }

            xCanvas.clear(xCanvas.ctx);

            var l = xCanvas.shapes.length;

            //selected UP! change order
            var data = xCanvas.shapes;
            xCanvas.shapes = [];
            for (var j = 0; j < l; j++) {
                if (xCanvas.mySel != data[j]) {
                    xCanvas.shapes.push(data[j]);
                }
            }
            if (xCanvas.mySel) {
                xCanvas.shapes.push(xCanvas.mySel);
            }

            // draw all shapes
            for (var i = 0; i < l; i++) {
                xCanvas.shapes[i].draw(xCanvas.ctx);
            }

            xCanvas.canvasValid = true;
            if (xCanvas.crop
                && xCanvas.myCrop.height != xCanvas.myCrop.y
                && xCanvas.myCrop.width != xCanvas.myCrop.x) {

                xCanvas.ctx.strokeStyle = 'blue';
                xCanvas.ctx.strokeRect(xCanvas.myCrop.x, xCanvas.myCrop.y, xCanvas.myCrop.width, xCanvas.myCrop.height);
            }
        }
    },
    //clear canvas
    clear: function (c) {
        c.clearRect(0, 0, this.canvasSize.width, this.canvasSize.height);
    },
    // Happens when the mouse is moving inside the canvas
    mouseMove: function (e) {
        var mouse = getMouse(e);
        if (xCanvas.isCrop) {
            var oldcx = xCanvas.myCrop.x;
            var oldcy = xCanvas.myCrop.y;
            xCanvas.myCrop.width = mouse.x - oldcx;
            xCanvas.myCrop.height = mouse.y - oldcy;
            xCanvas.canvasValid = false;
        } else {

            var minSize = 5;
            if (xCanvas.isDrag) {

                xCanvas.mySel.x = mouse.x - xCanvas.offsetx;
                xCanvas.mySel.y = mouse.y - xCanvas.offsety;

                // something is changing position so we better invalidate the canvas!
                xCanvas.canvasValid = false;
            } else if (xCanvas.isResizeDrag && xCanvas.mySel.resizable) {
                // time ro resize!
                var oldx = xCanvas.mySel.x;
                var oldy = xCanvas.mySel.y;

                // 0  1  2
                // 3     4
                // 5  6  7
                switch (xCanvas.expectResize) {
                    case 0:
                        if (xCanvas.mySel.width + oldx - mouse.x > minSize
                            && xCanvas.mySel.height + oldy - mouse.y > minSize) {
                            xCanvas.mySel.x = mouse.x;
                            xCanvas.mySel.y = mouse.y;
                            xCanvas.mySel.width += oldx - mouse.x;
                            xCanvas.mySel.height += oldy - mouse.y;
                        }
                        break;
                    case 1:
                        if (xCanvas.mySel.height + oldy - mouse.y > minSize) {
                            xCanvas.mySel.y = mouse.y;
                            xCanvas.mySel.height += oldy - mouse.y;
                        }
                        break;
                    case 2:
                        if (xCanvas.mySel.height + oldy - mouse.y > minSize
                            && mouse.x - oldx > minSize) {
                            xCanvas.mySel.y = mouse.y;
                            xCanvas.mySel.width = mouse.x - oldx;
                            xCanvas.mySel.height += oldy - mouse.y;
                        }
                        break;
                    case 3:
                        if (xCanvas.mySel.width + oldx - mouse.x > minSize) {
                            xCanvas.mySel.x = mouse.x;
                            xCanvas.mySel.width += oldx - mouse.x;
                        }
                        break;
                    case 4:
                        if (mouse.x - oldx > minSize) {
                            xCanvas.mySel.width = mouse.x - oldx;
                        }
                        break;
                    case 5:
                        if (xCanvas.mySel.width + oldx - mouse.x > minSize
                            && mouse.y - oldy > minSize) {
                            xCanvas.mySel.x = mouse.x;
                            xCanvas.mySel.width += oldx - mouse.x;
                            xCanvas.mySel.height = mouse.y - oldy;
                        }
                        break;
                    case 6:
                        if (mouse.y - oldy > minSize) {
                            xCanvas.mySel.height = mouse.y - oldy;
                        }
                        break;
                    case 7:
                        if (mouse.x - oldx > minSize && mouse.y - oldy > minSize) {
                            if (xCanvas.isPressKey('shift')) {
                                xCanvas.mySel.width = mouse.x - oldx;
                                xCanvas.mySel.height = mouse.x - oldx;
                            } else {
                                xCanvas.mySel.width = mouse.x - oldx;
                                xCanvas.mySel.height = mouse.y - oldy;
                            }
                        }
                        break;
                }

                xCanvas.canvasValid = false;
            }
            //hover
            var l = xCanvas.shapes.length;
            for (var h = l - 1; h >= 0; h--) {
                if (mouse.x >= xCanvas.shapes[h].x && mouse.x < xCanvas.shapes[h].x + xCanvas.shapes[h].width &&
                    mouse.y >= xCanvas.shapes[h].y && mouse.y < xCanvas.shapes[h].y + xCanvas.shapes[h].height) {

                    if (xCanvas.shapes[h].mousemove) {
                        xCanvas.shapes[h].mousemove();
                        xCanvas.shapes[h].onhover = true;
                        if(xCanvas.shapes[h].hover){
                            xCanvas.canvasValid = false;
                        }
                    }
                } else if(xCanvas.shapes[h].onhover) {
                    xCanvas.shapes[h].onhover = false;
                    if(xCanvas.shapes[h].hover){
                        xCanvas.canvasValid = false;
                    }
                }
            }

            // if there's a selection see if we grabbed one of the selection handles
            if (xCanvas.mySel !== null && !xCanvas.isResizeDrag) {
                for (var i = 0; i < 8; i++) {
                    // 0  1  2
                    // 3     4
                    // 5  6  7

                    var cur = xCanvas.selectionHandles[i];

                    // we dont need to use the ghost context because
                    // selection handles will always be rectangles
                    if (mouse.x >= cur.x && mouse.x <= cur.x + xCanvas.mySelBoxSize &&
                        mouse.y >= cur.y && mouse.y <= cur.y + xCanvas.mySelBoxSize) {
                        // we found one!
                        xCanvas.expectResize = i;
                        xCanvas.canvasValid = false;

                        switch (i) {
                            case 0:
                                this.style.cursor = 'nw-resize';
                                break;
                            case 1:
                                this.style.cursor = 'n-resize';
                                break;
                            case 2:
                                this.style.cursor = 'ne-resize';
                                break;
                            case 3:
                                this.style.cursor = 'w-resize';
                                break;
                            case 4:
                                this.style.cursor = 'e-resize';
                                break;
                            case 5:
                                this.style.cursor = 'sw-resize';
                                break;
                            case 6:
                                this.style.cursor = 's-resize';
                                break;
                            case 7:
                                this.style.cursor = 'se-resize';
                                break;
                        }
                        return;
                    }

                }
                // not over a selection box, return to normal
                xCanvas.isResizeDrag = false;
                xCanvas.expectResize = -1;
                this.style.cursor = 'auto';
            }
        }
    },

    // Happens when the mouse is clicked in the canvas
    mouseDown: function (e) {
        var mouse = getMouse(e);

        if (xCanvas.crop) {
            xCanvas.myCrop.x = mouse.x;
            xCanvas.myCrop.y = mouse.y;
            xCanvas.isCrop = true;
            xCanvas.myCrop.width = 0;
            xCanvas.myCrop.height = 0;
        } else {
            //we are over a selection box
            if (xCanvas.expectResize !== -1) {
                xCanvas.isResizeDrag = true;
                return;
            }

            xCanvas.clear(xCanvas.gctx);
            var l = xCanvas.shapes.length;
            for (var i = l - 1; i >= 0; i--) {
                // draw shape on ghost context
                xCanvas.shapes[i].draw(xCanvas.gctx, 'black');

                // get image data at the mouse x,y pixel
                var imageData = xCanvas.gctx.getImageData(mouse.x, mouse.y, 1, 1);
                // if the mouse pixel exists, select and break
                if (imageData.data[3] > 0) {
                    if (xCanvas.shapes[i].click) {
                        xCanvas.shapes[i].click();
                    }

                    if (xCanvas.shapes[i].selectable) {
                        xCanvas.mySel = xCanvas.shapes[i];
                        xCanvas.offsetx = mouse.x - xCanvas.mySel.x;
                        xCanvas.offsety = mouse.y - xCanvas.mySel.y;
                        xCanvas.mySel.x = mouse.x - xCanvas.offsetx;
                        xCanvas.mySel.y = mouse.y - xCanvas.offsety;
                        xCanvas.canvasValid = false;
                    }

                    if (xCanvas.shapes[i].dragable) {
                        xCanvas.isDrag = true;
                        xCanvas.canvasValid = false;
                    }


                    xCanvas.clear(xCanvas.gctx);
                    return;
                }
            }
        }
        // havent returned means we have selected nothing
        xCanvas.mySel = null;
        // clear the ghost canvas for next time
        xCanvas.clear(xCanvas.gctx);
        // invalidate because we might need the selection border to disappear
        xCanvas.canvasValid = false;
    },

    // mouse button is break
    mouseUp: function () {
        if (xCanvas.isCrop) {
            xCanvas.isCrop = false;
            xCanvas.canvasValid = false;
        }
        xCanvas.isDrag = false;
        xCanvas.isResizeDrag = false;
        xCanvas.expectResize = -1;
    },

    //call if dbl-click mouse
    mouseDblClick: function (fnc) {
        this.canvas.ondblclick = fnc;
        return this;
    },

    //create key combinations events
    keyHook: function (keys, func, cling) {
        xCanvas.combArray.push({keys: keys, func: func, cling: cling});
        var pressed = {};
        document.onkeydown = function (e) {
            e = e || window.event;

            pressed[e.keyCode] = true;
            var isCheck = false;

            for (var combo in xCanvas.combArray) {
                for (var i = 0; i < xCanvas.combArray[combo].keys.length; i++) { // проверить, все ли клавиши нажаты
                    if (pressed[xCanvas.combArray[combo].keys[i]]) {
                        isCheck = true;
                    } else {
                        isCheck = false;
                        break;
                    }
                }
                if (isCheck) {
                    if (!xCanvas.combArray[combo].cling) {
                        pressed = {};
                    }

                    xCanvas.combArray[combo].func();
                    return;
                }
            }
        };
        document.onkeyup = function (e) {
            e = e || window.event;
            delete pressed[e.keyCode];
        };
    },
    pressed: [],
    listenKeyboard: function() {
        document.onkeydown = function(e) {
            e = e || window.event;

            xCanvas.pressed[e.keyCode] = true;

        };
        document.onkeyup = function(e) {
            e = e || window.event;
            xCanvas.pressed[e.keyCode] = false;
        };
        return this;
    },
    isPressKey: function(key) {
        return this.pressed[this.getKey(key)];
    },

    //get radians by degrees
    toRadians: function (degrees) {
        return Math.PI / 180 * degrees;
    },
    //get degrees by radians
    toDegrees: function (radians) {
        return radians / (Math.PI / 180);
    },
    //get key by keycode
    getKey: function (code) {
        var keyCodes = {
            // Alphabet
            a: 65, b: 66, c: 67, d: 68, e: 69,
            f: 70, g: 71, h: 72, i: 73, j: 74,
            k: 75, l: 76, m: 77, n: 78, o: 79,
            p: 80, q: 81, r: 82, s: 83, t: 84,
            u: 85, v: 86, w: 87, x: 88, y: 89, z: 90,
            // Numbers
            n0: 48, n1: 49, n2: 50, n3: 51, n4: 52,
            n5: 53, n6: 54, n7: 55, n8: 56, n9: 57,
            // Controls
            tab: 9, enter: 13, shift: 16, backspace: 8,
            ctrl: 17, alt: 18, esc: 27, space: 32,
            menu: 93, pause: 19, cmd: 91,
            insert: 45, home: 36, pageup: 33,
            'delete': 46, end: 35, pagedown: 34,
            // F*
            f1: 112, f2: 113, f3: 114, f4: 115, f5: 116, f6: 117,
            f7: 118, f8: 119, f9: 120, f10: 121, f11: 122, f12: 123,
            // numpad
            np0: 96, np1: 97, np2: 98, np3: 99, np4: 100,
            np5: 101, np6: 102, np7: 103, np8: 104, np9: 105,
            npslash: 11, npstar: 106, nphyphen: 109, npplus: 107, npdot: 110,
            // Lock
            capslock: 20, numlock: 144, scrolllock: 145,
            // Symbols
            equals: 61, hyphen: 109, coma: 188, dot: 190,
            gravis: 192, backslash: 220, sbopen: 219, sbclose: 221,
            slash: 191, semicolon: 59, apostrophe: 222,
            // Arrows
            aleft: 37, aup: 38, aright: 39, adown: 40
        };

        return keyCodes[code];
    },
    //get real font height
    getFontHeight: function (font) {
        var parent = document.createElement("span");
        parent.appendChild(document.createTextNode("height"));
        document.body.appendChild(parent);
        parent.style.cssText = "font: " + font + "; white-space: nowrap; display: inline;";
        var height = parent.offsetHeight;
        document.body.removeChild(parent);
        return height;
    }
};

//get mouse coordinats
function getMouse(e) {

    if (xCanvas.offsetX === null) {
        var element = xCanvas.canvas;
        xCanvas.offsetX = 0;
        xCanvas.offsetY = 0;

        if (element.offsetParent) {
            do {
                xCanvas.offsetX += element.offsetLeft;
                xCanvas.offsetY += element.offsetTop;
            } while ((element = element.offsetParent));
        }

        // Add padding and border style widths to offset
        xCanvas.offsetX += xCanvas.stylePaddingLeft;
        xCanvas.offsetY += xCanvas.stylePaddingTop;

        xCanvas.offsetX += xCanvas.styleBorderLeft;
        xCanvas.offsetY += xCanvas.styleBorderTop;
    }

    return {
        x: e.pageX - xCanvas.offsetX,
        y: e.pageY - xCanvas.offsetY
    };
}

//shape object
function Shape(options) {
    this.alias = null;
    this.x = 0;
    this.y = 0;
    this.width = 1;
    this.height = 1;

    this.fill = '#AAAAAA';
    this.angle = 0;
    this.image = null;
    this.sprites = null;
    this.align = null;

    this.click = null;
    this.hover = null;
    this.mousemove = null;
    this.onhover = false;
    this.selectable = false;
    this.dragable = false;
    this.resizable = false;
    this.reversAnimation = false;
    this.reversed = false;

    if (options.image !== undefined) {
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
    } else {
        if (options.height !== undefined) {
            this.height = options.height;
        }
        if (options.width !== undefined) {
            this.width = options.width;
        }
    }
    if (options.x !== undefined) {
        this.x = options.x;
    }
    if (options.y !== undefined) {
        this.y = options.y;
    }

    if (options.angle !== undefined) {
        this.angle = options.angle;
    }
    if (options.fill !== undefined) {
        this.fill = options.fill;
    }

    if (options.alias !== undefined) {
        this.alias = options.alias;
    }

    if (options.click !== undefined) {
        this.click = options.click;
    }
    if (options.hover !== undefined) {
        this.hover = options.hover;
    }
    if (options.mousemove !== undefined) {
        this.mousemove = options.mousemove;
    }
    if (options.sprites !== undefined) {
        this.sprites = options.sprites;
    }
    if (options.reversAnimation !== undefined) {
        this.reversAnimation = options.reversAnimation;
    }

    if (options.selectable !== undefined) {
        this.selectable = options.selectable;
        if (options.dragable !== undefined) {
            this.dragable = options.dragable;
        }
        if (options.resizable !== undefined) {
            this.resizable = options.resizable;
        }
    }
}

Shape.prototype = {
    draw: function (context) {

        if (context === xCanvas.gctx) {
            context.fillStyle = 'black'; // always want black for the ghost canvas
        } else {
            context.fillStyle = this.fill;
        }

        // We can skip the drawing of elements that have moved off the screen:
        if (this.x > xCanvas.canvasSize.width || this.y > xCanvas.canvasSize.height) return;
        if (this.x + this.width < 0 || this.y + this.height < 0) return;

        //for hover
        var image, align, orginWidth, orginHeight, x, y, width, height;
        if (this.onhover && this.hover.image) {
            image = this.hover.image;
        } else {
            image = this.image;
        }
        if (this.onhover && this.hover.align !== undefined) {
            align = this.hover.align;
        } else {
            align = this.align;
        }

        if (this.onhover && this.hover.orginWidth) {
            orginWidth = this.hover.orginWidth;
        } else {
            orginWidth = this.orginWidth;
        }
        if (this.onhover && this.hover.orginHeight) {
            orginHeight = this.hover.orginHeight;
        } else {
            orginHeight = this.orginHeight;
        }
        if (this.onhover && this.hover.x) {
            x = this.hover.x;
        } else {
            x = this.x;
        }
        if (this.onhover && this.hover.y) {
            y = this.hover.y;
        } else {
            y = this.y;
        }
        if (this.onhover && this.hover.width) {
            width = this.hover.width;
        } else {
            width = this.width;
        }
        if (this.onhover && this.hover.height) {
            height = this.hover.height;
        } else {
            height = this.height;
        }


        if (this.image) {
            if (align !== null) {
                context.drawImage(
                    image,
                    align,
                    0,
                    orginWidth,
                    orginHeight,
                    x,
                    y,
                    width,
                    height
                );
                if (this.sprites) {
                    if (this.reversAnimation) {
                        if (align + orginWidth >= this.sprites * orginWidth) {
                            this.reversed = true;
                        } else if(align - orginWidth <= 0) {
                            this.reversed = false;
                        }
                        if (this.reversed) {
                            this.align -= orginWidth;
                        } else {
                            this.align += orginWidth;
                        }

                    } else {
                        if (align + orginWidth >= this.sprites * orginWidth) {
                            this.align = 0;
                        } else {
                            this.align += orginWidth;
                        }
                    }

                }

            } else {
                context.drawImage(image, x, y, width, height);
            }
        } else {
            context.fillRect(x, y, width, height);
        }

        // draw selection
        // this is a stroke along the box and also 8 new selection handles
        if (xCanvas.mySel === this) {
            context.strokeStyle = xCanvas.mySelColor;
            context.lineWidth = xCanvas.mySelWidth;
            context.strokeRect(this.x, this.y, this.width, this.height);

            // draw the boxes

            var half = xCanvas.mySelBoxSize / 2;

            // 0  1  2
            // 3     4
            // 5  6  7

            // top left, middle, right
            xCanvas.selectionHandles[0].x = this.x - half;
            xCanvas.selectionHandles[0].y = this.y - half;

            xCanvas.selectionHandles[1].x = this.x + this.width / 2 - half;
            xCanvas.selectionHandles[1].y = this.y - half;

            xCanvas.selectionHandles[2].x = this.x + this.width - half;
            xCanvas.selectionHandles[2].y = this.y - half;

            //middle left
            xCanvas.selectionHandles[3].x = this.x - half;
            xCanvas.selectionHandles[3].y = this.y + this.height / 2 - half;

            //middle right
            xCanvas.selectionHandles[4].x = this.x + this.width - half;
            xCanvas.selectionHandles[4].y = this.y + this.height / 2 - half;

            //bottom left, middle, right
            xCanvas.selectionHandles[6].x = this.x + this.width / 2 - half;
            xCanvas.selectionHandles[6].y = this.y + this.height - half;

            xCanvas.selectionHandles[5].x = this.x - half;
            xCanvas.selectionHandles[5].y = this.y + this.height - half;

            xCanvas.selectionHandles[7].x = this.x + this.width - half;
            xCanvas.selectionHandles[7].y = this.y + this.height - half;


            context.fillStyle = xCanvas.mySelBoxColor;
            for (var i = 0; i < 8; i++) {
                var cur = xCanvas.selectionHandles[i];
                context.fillRect(cur.x, cur.y, xCanvas.mySelBoxSize, xCanvas.mySelBoxSize);
            }
        }

    }
};

//create circles
function CircleShape(options) {
    this.x = 0;
    this.y = 0;
    this.radius = 1;
    this.alias = null;
    this.height = 5;
    this.width = 5;

    this.fill = '#AAAAAA';
    this.stroke = "black";
    this.lineWidth = 1;

    this.click = null;
    this.hover = null;
    this.mousemove = null;
    this.onhover = false;
    this.selectable = false;
    this.dragable = false;
    this.resizable = false;

    if (options.alias !== undefined) {
        this.alias = options.alias;
    }
    if (options.radius !== undefined) {
        this.radius = options.radius;
    }
    if (options.x !== undefined) {
        this.x = options.x;
    }
    if (options.y !== undefined) {
        this.y = options.y;
    }
    if (options.height !== undefined) {
        this.height = options.height;
    }
    if (options.width !== undefined) {
        this.width = options.width;
    }
    if (options.fill !== undefined) {
        this.fill = options.fill;
    }
    if (options.stroke !== undefined) {
        this.stroke = options.stroke;
    }
    if (options.lineWidth !== undefined) {
        this.lineWidth = options.lineWidth;
    }

    if (options.click !== undefined) {
        this.click = options.click;
    }
    if (options.hover !== undefined) {
        this.hover = options.hover;
    }
    if (options.mousemove !== undefined) {
        this.mousemove = options.mousemove;
    }

    if (options.selectable !== undefined) {
        this.selectable = options.selectable;
        if (options.dragable !== undefined) {
            this.dragable = options.dragable;
        }
        if (options.resizable !== undefined) {
            this.resizable = options.resizable;
        }
    }

    this.draw = function(context) {

        if (context === xCanvas.gctx) {
            context.fillStyle = 'black'; // always want black for the ghost canvas
        } else {
            context.fillStyle = this.fill;
        }

        // We can skip the drawing of elements that have moved off the screen:
        if (this.x > xCanvas.canvasSize.width || this.y > xCanvas.canvasSize.height) return;
        if (this.x + this.width < 0 || this.y + this.height < 0) return;

        context.beginPath();
        context.arc(this.x + this.width / 2 , this.y + this.height / 2, this.width / 2, 0, 2 * Math.PI, false);
        context.fill();
        context.lineWidth = this.lineWidth;
        context.strokeStyle = this.stroke;
        context.stroke();

        // draw selection
        // this is a stroke along the box and also 8 new selection handles
        if (xCanvas.mySel === this) {
            context.strokeStyle = xCanvas.mySelColor;
            context.lineWidth = xCanvas.mySelWidth;
            context.strokeRect(this.x, this.y, this.width, this.height);

            // draw the boxes

            var half = xCanvas.mySelBoxSize / 2;

            // 0  1  2
            // 3     4
            // 5  6  7

            // top left, middle, right
            xCanvas.selectionHandles[0].x = this.x - half;
            xCanvas.selectionHandles[0].y = this.y - half;

            xCanvas.selectionHandles[1].x = this.x + this.width / 2 - half;
            xCanvas.selectionHandles[1].y = this.y - half;

            xCanvas.selectionHandles[2].x = this.x + this.width - half;
            xCanvas.selectionHandles[2].y = this.y - half;

            //middle left
            xCanvas.selectionHandles[3].x = this.x - half;
            xCanvas.selectionHandles[3].y = this.y + this.height / 2 - half;

            //middle right
            xCanvas.selectionHandles[4].x = this.x + this.width - half;
            xCanvas.selectionHandles[4].y = this.y + this.height / 2 - half;

            //bottom left, middle, right
            xCanvas.selectionHandles[6].x = this.x + this.width / 2 - half;
            xCanvas.selectionHandles[6].y = this.y + this.height - half;

            xCanvas.selectionHandles[5].x = this.x - half;
            xCanvas.selectionHandles[5].y = this.y + this.height - half;

            xCanvas.selectionHandles[7].x = this.x + this.width - half;
            xCanvas.selectionHandles[7].y = this.y + this.height - half;


            context.fillStyle = xCanvas.mySelBoxColor;
            for (var i = 0; i < 8; i++) {
                var cur = xCanvas.selectionHandles[i];
                context.fillRect(cur.x, cur.y, xCanvas.mySelBoxSize, xCanvas.mySelBoxSize);
            }
        }
    };
}

/*
Load files
id (string) #id
type (string) Load file type
calback (function) on load
 */
function fileLoader(id, type, calback) {
    var aceptArray = [];
    if (type == 'image') {
        var reg = 'image.*';
    }
    document.getElementById(id).addEventListener('change', function (evt) {
        var filesArray = evt.target.files; // FileList object
        // files is a FileList of File objects. List some properties.
        var f;
        for (var i = 0; f = filesArray[i]; i++) {
            // Only process image files.
            if (type && !f.type.match(reg)) {
                continue;
            }
            aceptArray.push(f);

            (function (f) {
                var reader = new FileReader();
                reader.onload = function (event) {

                    var src = event.target.result;
                    var img = new Image;
                    img.onload = function () {
                        calback(img, f);
                    };
                    img.src = src;
                };
                // Read in the file as a data URL.
                reader.readAsDataURL(f);
            })(f);

        }
    }, false);
}

/**
 * User: Alexander
 * Date: 16.04.12
 * Time: 18:46
 */
var preloader = {

    count: 0,

    loaded: 0,

    errors: 0,

    log: false,

    callback: null,

    supportType: null,

    result: {},

    init: function (callback) {

        this.callback = callback;
        this.checkSupport();
    },
    loadImage: function (param) {

        var img = document.createElement('img');
        this.count++;

        img.onload = function () {
            preloader.loaded++;
            if (preloader.log) {
                console.log('  Loaded: ' + param.alias + ' - ' + param.src);
            }
            preloader.result[param.alias] = this;
            preloader.isComplete();
        };

        img.onerror = function () {
            preloader.errors++;
            if (preloader.log) {
                console.log('  Error loading: ' + param.alias + ' - ' + param.src);
            }
            preloader.isComplete();
        };

        img.src = param.src;

    },

    loadSong: function (param) {
        var audio = document.createElement('audio');
        this.count++;

        var popitka = 0;


        var audioReady = function () {
            if (audio.readyState) {
                preloader.loaded++;
                if (preloader.log) {
                    console.log('  Loaded: ' + param.alias + ' - ' + param.src.replace(/\*/g, preloader.getAudioExtension()));
                }
                preloader.result[param.alias] = audio;
                preloader.isComplete();
            } else {
                popitka++;
                if (popitka > 80) {

                    preloader.errors++;
                    if (preloader.log) {
                        console.log('  Error loading: ' + param.alias + ' - ' + param.src.replace(/\*/g, preloader.getAudioExtension()));
                    }
                    preloader.isComplete();

                } else {
                    setTimeout(audioReady, 250);
                }

            }
        };
        audioReady();
        audio.src = param.src.replace(/\*/g, this.getAudioExtension());
        audio.load();
    },

    getAudioExtension: function () {
        return this.supportType.ogg ? 'ogg' :
                this.supportType.mp3 ? 'mp3' : 'wav';
    },
    checkSupport: function () {
        var elem = document.createElement('audio');
        if (elem.canPlayType) {
            this.supportType = {
                // codecs
                ogg: elem.canPlayType('audio/ogg; codecs="vorbis"'),
                mp3: elem.canPlayType('audio/mpeg;'),
                wav: elem.canPlayType('audio/wav; codecs="1"'),
                m4a: elem.canPlayType('audio/x-m4a;') || elem.canPlayType('audio/aac;')
            };
        }
    },

    isComplete: function () {
        if (this.loaded + this.errors == this.count) {
            if (this.log) {
                console.log('Loaded: ' + this.loaded + '/' + this.count + ' files.');
            }
            if (this.callback) {
                this.callback(preloader.result);
            }

        }
    }
};
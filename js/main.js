/**
 * User: Alexander
 * Date: 06.11.11
 * Time: 18:39
 */

LibCanvas.extract();

var canvasSize = {
    x: window.innerWidth,
    y: window.innerHeight
};

var speed = 10;

var maxForwardSpeed = 25;

var forwardSpeed = 12;

var backSpeed = 7;

var timeOnLevel = parseInt(((canvasSize.x * canvasSize.y)/10000) + speed, 10);

atom.dom(function () {

    var startText = '  Здраствуйте.\n  Вы находитесь на военной базе "Глаз Быка".\n\n';
    startText += '  К нам прибыли рекомендации с академии, где вы показали не плохие результаты.';
    startText += 'Но мы хотели бы убедится, так ли вы хороши, как описаны в этих бумажках.';
    startText += '\n  Мы вам выдаем корабль без вооружения, и с блокиратором двигателя, т.е. вам не удастся покинуть зону радара.';
    startText += '\n  Ваше первое задание ... ну, скажем, собрать космический мусор, пока мы не погрязли в отходах.';
    startText += '\n  Так что, салага -- в ангар!';


    var Cistern = atom.Class({
        position : null,

        Extends : LibCanvas.Scene.Element,
        Implements: [
            Draggable, Clickable
        ],
        animation: null,

        destruction: null,

        initialize : function (position) {
            this._pos = position;

            this._boom = false;
            this._type = 'cistern';
            //this._nextType = 'cistern';

            this.addEvent('libcanvasSet', function () {
                this.animation = new LibCanvas.Animation.Sprite()
                    .addSprites(this.libcanvas.getImage('cistern'), 25);

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

        set boom (value) {
            this._boom = value;
        },
        get type () {
            return this._type;
        },
        set type (value) {
            this._type = value;
        },

        draw : function () {
            if (!play){
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
                    this.libcanvas.rmElement(this);
                    this.destruction.stop(true);

                }.bind(this));
                this.destruction.sprite && this.libcanvas.ctx.drawImage({
                        image : this.destruction.sprite,
                        center: this._pos
                    });
                this.libcanvas.getAudio('explosion').play();

            } else {
                if (this._type == 'nark') {

                    this.libcanvas.ctx.drawImage({
                        image : this.libcanvas.getImage('nark'),
                        center: this._pos
                        //center: [this._x, this._y],
                        //angle: (this._angle).degree()//this._angle
                    });

                } else if (this._type == 'cistern') {
                    if (
                        this.animation.run({
                            line : Array.range(0,96),
                            delay: 40,
                            loop : true
                        }) ) {
                        this.libcanvas.ctx.drawImage({
                            image : this.animation.sprite,
                            center: this._pos
                            //center: [this._x, this._y],
                            //angle: (this._angle).degree()//this._angle
                        });
                    }
                }
            }
        }
    });

    var CountCisterns = atom.Class({
        Extends : LibCanvas.Behaviors.Drawable,
        Implements: [
            atom.Class.Events,
            LibCanvas.Invoker.AutoChoose
        ],
        initialize: function (text, time) {
            this._num = 0;
            this.text = text;
            this._time = time;
            this._color = '#00ffff';
            this._structure = false;
        },

        get num () {
            return this._num;
        },
        set num (value) {
            this._num = value;
        },
        set time (value) {
            this._time = value;
        },
        set structure (value) {
            this._structure = value;
        },
        draw: function () {

            if (this._time < 10 || (this._structure && this._structure < 30)) {
                this._color = '#ff0000';
            } else if (this._time < 20 || (this._structure && this._structure < 75)) {
                this._color = '#ffff00';
            } else {
                this._color = '#00ffff';
            }
            var structurLabel = '';
            if (this._structure) {
                structurLabel = '\nStructure: ' + this._structure;
            }
            this.libcanvas.ctx.text({
                text: this.text + this._num + '\nTime: ' + this._time + structurLabel,
                color: this._color
                });
        }
    });

    var angle = 0;

    var libcanvas = new LibCanvas('canvas', {
        fps: 24,
        //invoke: true,
        preloadImages: {
            feiws: 'images/feiws.png',
            malocrs: 'images/malocrs.png',
            pelengps: 'images/pelengps.png',
            gaalrs: 'images/gaalrs.png',
            peopleps: 'images/peopleps.png',
            cistern: 'images/cistern.png',
            des: 'images/des.png',
            background: 'images/1bg.png',
            dialog: 'images/2BG.png',
            dialogBadTv: 'images/2TV.png',
            dispatcher: 'images/signal.png',
            nark: 'images/1GOODS8.png',
            hedgehog: 'images/hedgehog.png',
            asteroid_11: 'images/asteroid_11.png',
            asteroid_12: 'images/asteroid_12.png',
            asteroid_14: 'images/asteroid_14.png'

        },
        preloadAudio: {
            explosion : 'sounds/EXPL2.*',
            buy: 'sounds/buy.*'
        }
    })
    .size(canvasSize.x, canvasSize.y, true)
    .listenMouse()
    .start(function () {
        //this.ctx.drawImage( this.getImage('test') );
    })
    .addEvent('ready', function () {

        var p = timeOnLevel;

        var bgLayer = libcanvas.createLayer('background', 0);
        bgLayer.ctx.drawImage({
            image: libcanvas.getImage('background'),
            //crop : [100, 100, 50, 50],
            draw : [0, 0, canvasSize.x, canvasSize.y]
        });

        var ship = new Ship([canvasSize.x/2, canvasSize.y/2], angle, [canvasSize.x, canvasSize.y]);
        libcanvas.addElement(ship);
        ship.moving = false;
        ship.playing = false;

        var cistern = new Cistern([-100, -100]);
        var trouble = new Trouble([-100, -100]);
        var asteroid = new Asteroid(canvasSize);


        libcanvas.addElement(cistern);
        libcanvas.addElement(trouble);
        libcanvas.addElement(asteroid);

        var cCisterns = new CountCisterns("Score: ", p);
        libcanvas.addElement(cCisterns);


        var topLayer = libcanvas.createLayer('front');

        var dialogLayer = libcanvas.createLayer('dialog');
        var answersLayer = libcanvas.createLayer('answers');


        function ignore(){
            drawDialog('Пшол вон!', []);
            var drawOptions = [
                {
                    text: ' - Ладно, Полетели!',
                    method : choseShip
                }
            ];
            drawDialog('  Пшол вон!', drawOptions);
        }

        function start(){
            dialogLayer.hide();
            answersLayer.hide();
            ///////////////////////////////
            ship.playing = true;
            ship.moving = true;
            ship.x = [Number.random(40, canvasSize.x-40), Number.random(40, canvasSize.y-40)];
            ship.y =  [Number.random(40, canvasSize.x-40), Number.random(40, canvasSize.y-40)];
            ship.moving = true;
            ship.playing = true;
            ship.x = [Number.random(50, canvasSize.x-50), Number.random(50, canvasSize.y-50)];
            ship.y = [Number.random(50, canvasSize.x-50), Number.random(50, canvasSize.y-50)];
            cCisterns.num = 0;
            ship.structure = 200;
            cCisterns.structure = ship.structure;
            trouble.pos = [Number.random(50, canvasSize.x-50), Number.random(50, canvasSize.y-50)];

            if (p == 0 || !ship.moving) {
                p = 0;
                //topLayer.ctx.clearAll();
                //or  libcanvas.layer('front').ctx.clearAll()
                setTimeout( function() {

                    libcanvas.addElement(cistern);
                    if (cistern.type == 'nark') {

                    }
                    cistern.pos = [Number.random(50, canvasSize.x-50), Number.random(50, canvasSize.y-50)];
                    asteroid.fly = true;
                    run();
                    ship.moving = true;
                } , 1000);

            }
            p = timeOnLevel;
            cCisterns.time = p;
            //////////////////////////////
        }

        function instruct(){
            //console.log('jjjj');
            var drawOptions = [
                {
                    text: ' - Мне нужен иструктаж!',
                    method : ignore
                },
                {
                    text: ' - А как же напутствие?',
                    method: anekdot
                },
                {
                    text: ' - Полетели!',
                    method : choseShip
                }
            ];
            drawDialog('  Тебе, что делать нечего?', drawOptions);
        }

        var dialogs = new Dialog(dialogLayer, []);
        libcanvas.addElement(dialogs);

        function anekdot2(){
            var drawOptions = [
                {
                    text: ' - Ну, пожалкста',
                    method: anekdot
                },
                {
                    text: ' - Полетели!',
                    method : choseShip
                }
            ];
            drawDialog('  Я же только что расказал.', drawOptions);
        }

        function choseShip(){
            var drawOptions = [
                {
                    text: ' - Корсар-256',
                    method : chosePeople
                },
                {
                    text: ' - Рейнджер-512',
                    method: choseGaal
                },

                {
                    text: ' - Это и всё?',
                    method: choseShip2
                }
            ];
            var message = '  Ах, да вы же забыли выбрать корабль! \n Куда же без него. Кхе-хе...';
             drawDialog(message, drawOptions);
        }
        function choseShip2(){
            var drawOptions = [
                {
                    text: ' - Воин-128',
                    method: choseFeiw
                },
                {
                    text: ' - Пират-64',
                    method: chosePeleng
                },
                {
                    text: ' - Рейнджер-1024',
                    method : choseMaloc
                }
            ];
            var message = '  Это резерв. Больше нету. Выбирай и не командуй!';
             drawDialog(message, drawOptions);
        }
        function chosePeople(){
            ship.shipType = 'peopleps';
            start();
        }
        function choseFeiw(){
            ship.shipType = 'feiws';
            start();
        }
        function choseGaal(){
            ship.shipType = 'gaalrs';
            start();
        }
        function chosePeleng(){
            ship.shipType = 'pelengps';
            start();
        }
        function choseMaloc(){
            ship.shipType = 'malocrs';
            start();
        }
        function anekdot(){
            var drawOptions = [
                {
                    text: ' - Мне нужен иструктаж!',
                    method : instruct
                },
                {
                    text: ' - А можно ещё одно?',
                    method: anekdot2
                },
                {
                    text: ' - Полетели!',
                    method : choseShip
                }
            ];

            var quote = [];

            quote[0] = "Если действительно хочешь чего-то добиться в жизни, придется много над этим работать. А теперь тихо: сейчас объявят выигрышные номера лотереи.";
            quote[1] = "Спокойно, без паники, если что, заработаю денег, продав одну из своих печенок. Обе мне все равно ни к чему.";
            quote[2] = "Дети – наше будущее. Вот почему их надо остановить сейчас.";
            quote[3] = "Давайте выпьем за алкоголь – источник и решение всех наших проблем.";
            quote[4] = "Если ты счастлив и осознаешь это – выругайся.";
            quote[5] = "Образование мне не поможет. Каждый раз, когда я что-то запоминаю, это что-то занимает место, выпихнув из мозгов что-нибудь ещё. Как в тот раз, когда я пошёл на курсы виноделия и разучился водить машину.";
            quote[6] = "Женщины – они как пиво. Хорошо выглядят, хорошо пахнут, и ты готов переступить через собственную мать, лишь бы заполучить их.";
            quote[7] = "Сынок, ты говоришь «жополиз» так, как будто это что-то плохое.";
            quote[8] = "Не стоит горевать. Люди постоянно умирают. Как знать, может и ты проснёшься завтра мёртвым.";
            quote[9] = "Я не лягу в одну кровать с женщиной, которая считает меня лентяем. Раз так, пусть раздвинет в гостиной диван и застелит постель. Я спать хочу.";
            quote[10] = "Убить босса?! Поднимется ли у меня рука осуществить американскую мечту?";
            quote[11] = "Для вранья нужны двое. Один врёт, другой слушает.";
            quote[12] = "Попытка – первый шаг к провалу.";
            quote[13] = "Послушайте, у людей всегда найдётся какая-нибудь статистика. Это известно 14% населения.";
            quote[14] = "Не вижу смысла выходить из дома. Мы всё равно каждый раз возвращаемся обратно.";
            quote[15] = "Слезами пса не вернешь. Если только слезы не пахнут собачьей едой. Так что можно сидеть дома, поглощая банку за банкой собачью еду, пока слезы не начнут отдавать ею, чтобы пес учуял запах с улицы и вернулся сам. А можно просто пойти и поискать его.";
            quote[16] = "Психиатр нам не нужен. Мы и так знаем, что наш ребенок со сдвигом.";
            quote[17] = "Я вижу улыбки своих детей. И понимаю, что они затеяли что-то недоброе.";
            quote[18] = "Если ты будешь злиться на меня каждый раз, когда я делаю глупость, мне придётся прекратить делать глупости.";
            quote[19] = "Ты можешь здорово разбираться в чем-то, но всегда найдётся 1000000 человек, делающих это ещё лучше.";
            quote[20] = "Нельзя постоянно винить себя за что-то. Обвините себя разок, и спокойно живите дальше.";
            quote[21] = "Всю мою жизнь я мечтал об одном – достичь всех своих целей.";
            quote[22] = "Дети – те же обезьяны. Только шума от них больше.";
            quote[23] = "Можно работать на нескольких работах одновременно и всё равно быть лентяем.";
            quote[24] = "Не хватало ещё, чтобы какой-нибудь хирург показывал, как мне себя оперировать!";
            quote[25] = "Будь щедрее в постели. Поделись бутербродом!";
            quote[26] = "Иногда я лежу в постели и думаю, что ничто не заставит меня встать. А потом чувствую,как подо мной становится мокро, и понимаю, что ошибался.";
            quote[27] = "Дурак и деньги быстро расстаются. Я бы заплатил много денег тому, кто бы объяснил мне эту закономерность.";
            quote[28] = "Каким бы мощным и удивительным он ни был, я не потерплю наездов даже от океана!";
            quote[29] = "Всегда лучше наблюдать за процессом, чем делать что-то самому.";
            quote[30] = "Чтобы тебя любили – приходится быть со всеми хорошим каждый день. Чтобы ненавидели – напрягаться не приходится вообще.";
            quote[31] = "Жизнь-это просто куча всякой фигни, которая происходит.";
            quote[32] = "Единственный способ заставить всех думать о тебе хорошо это заставить всех думать о себе плохо. Я устал доставлять всем удовольствие думать о себе хорошо…";
            quote[33] = "Пиво… Моя единственная слабость. Моя ахиллесова пята, если хотите.";
            quote[34] = "Если ты счастлив и осознаешь это, выругайся.";
            quote[35] = "Образование мне не поможет. Каждый раз, когда я что-то запоминаю, это что-то занимает место, выпихнув из мозгов что-нибудь еще. Как в тот раз, когда я пошел на курсы виноделия и разучился водить машину.";
            quote[36] = "В католицизме больше глупых правил, чем в видеопрокате.";
            quote[37] = "Конечно, папа сделал в жизни много хорошего, но теперь он состарился, а старые люди абсолютно бесполезны.";
            quote[38] = "Не стоит горевать. Люди постоянно умирают. Как знать, может и ты проснешься завтра мертвым.";
            quote[39] = "Ха-ха-ха! Моя дочь думает, что вампиры — это реальные существа! Да они же выдуманные, как эльфы, гремлины или эскимосы.";
            quote[40] = "Моя любимая книга: «Итак, вы решили самовольно подключиться к кабельному телевидению».";
            quote[41] = "Отныне я буду с нетерпением ждать всего подряд. Боже мой! Завтра пройдет специальная акция: две скамейки для пианино по цене одной! Ой-ой-ой, скорей бы завтра!";
            quote[42] = "Радиация убивает только тех, кто ее боится.";
            quote[43] = "Я белый мужчина от 18 до 49. И все слушают меня, какую бы ахинею я ни нес.";
            quote[44] = "Нелегко разрываться между беременной женой и неуравновешенным ребенком, но свои восемь часов у телевизора я все-таки выкроил.";
            quote[45] = "Убить босса?! Поднимется ли у меня рука исполнить американскую мечту?";
            quote[46] = "Старикам не нужна компания. Их нужно изолировать и изучать, чтобы выяснить, нет ли в них каких-нибудь полезных для нас веществ.";
            quote[47] = "Оператор, как позвонить в 911?.";
            quote[48] = "Единственно важное в жизни — быть популярным.";
            quote[49] = "Атомный реактор — как женщина. Нужно только прочитать инструкцию и вовремя нажать на правильную кнопку.";
            quote[50] = "Я вижу улыбки своих детей. И понимаю, что они затеяли что-то недоброе.";
            quote[51] = "Собственную мать не проведешь. Ее нельзя одурачить даже самого первого апреля, даже если у тебя при себе будет электрический одурачивательный стул.";
            quote[52] = "Идти на компромисс? Не на ту семью напали!";
            quote[53] = "Моя мать сказала как-то одну вещь, которая преследует меня. Она сказала: «Гомер, ты большое разочарование». Что-то ведь она имела в виду, успокой Господь ее душу.";
            quote[54] = "Неохраняемый завтрак — самое сладкое табу.";
            quote[55] = "Когда дело касается комплиментов, женщины становятся неуемными кровососущими монстрами и требуют еще, еще и еще. Но если удовлетворить их желание, плата будет сладкой.";
            quote[56] = "Пение — это низшая форма общения.";
            quote[57] = "И когда же я наконец пойму, что ответы на жизненные вопросы находятся не на дне бутылки. Они в телевизоре!";
            quote[58] = "Благослови Господь атеистов!";
            quote[59] = "В спорте главное не победа. Главное — чтобы удалось напиться!";
            quote[60] = "Думаю, мистер Смитерс нанял меня за способность к мотивации. Все коллеги говорят, что теперь им приходится работать вдвое больше!";
            quote[61] = "Факты абсолютно бессмысленны. Имея факты, можно доказать любую небылицу!";
            quote[62] = "Не может ведь бог успевать повсюду, правда?";
            quote[63] = "Во Франции никто не зовет меня «жирным придурком». Здесь я гурман!";
            quote[64] = "Меня утомляют танцы с сексуальной подоплекой.";
            quote[65] = "Иногда я способен убить в приступе злости или чтобы доказать свою правоту. Но я не какой-нибудь маньяк.";
            quote[66] = "Не бывает невкусных пончиков.";
            quote[67] = "Своего третьего отпрыска назовите просто Ребенок. Поверьте, это избавит вас от лишней путаницы.";
            quote[68] = "Я взбирался на самые высокие горы, опускался в самые низкие лощины. Побывал в Африке и Японии. Даже слетал в космос. Но сейчас я, не задумываясь, променял бы все это на что-нибудь сладенькое.";
            quote[69] = "Вы можете много чего получить на халяву, упомянув это в интервью какому-нибудь журналу. Печенье Chips Ahoy!";
            quote[70] = "Умные итальянцы? Что-то здесь не так.";
            quote[71] = "Будь щедрее в постели. Поделись бутербродом.";
            quote[72] = "Дайте человеку рыбу — и он будет сыт весь день. Научите человека удить — и он непременно зацепится крючком за веко или что-нибудь в этом роде.";
            quote[73] = "Общественный транспорт — для придурков и лесбиянок.";
            quote[74] = "Отец никогда не верил в меня. Я не стану повторять его ошибок: с сегодняшнего дня я буду мягче со своим сыном. И жестче с отцом.";
            quote[75] = "Даже если вы берете что-то у соседа на время, все равно лучше делать это под покровом темноты.";
            quote[76] = "Я не стану лукавить: быть отцом непросто. Не то что матерью.";
            quote[77] = "В моем доме мы подчиняемся только законам термодинамики.";
            quote[78] = "Всегда лучше наблюдать за процессом, чем делать что-то самому.";
            quote[79] = "Чтобы тебя любили, приходится быть со всеми хорошим каждый день. Чтобы ненавидели — напрягаться не приходится вообще.";
            quote[80] = "Жизнь — это просто куча всякой фигни, которая происходит.";
            quote[81] = "Я тут считал налоги и случайно доказал, что бога нет.";
            quote[82] = "Если мне наплевать, это ещё не значит, что я не понимаю.";
            quote[83] = "Так выпьем же за алкоголь — источник и решение всех наших проблем!";
            quote[84] = "Почему? Потому, Барт, что я целовал лишь одну девчонку? Все равно на одну больше чем ты.";

                var anekdot = '  Ну вот, слушай: \n\n';
                anekdot += quote[Math.floor(Math.random() * (84 + 1))];

                drawDialog(anekdot, drawOptions);
        }

        var drawOptions = [
            {
                text: ' - Мне нужен иструктаж',
                method: instruct
            },
            {
                text: ' - А как же напутствие?',
                method: anekdot
            },
            {
                text: ' - Полетели!',
                method: choseShip
            }
        ];

        /////////////////////////////////
        drawDialog(startText, drawOptions);
        /////////////////////////////////


            function drawDialog(quastion, answersOptions) {
                answersLayer.ctx.clearAll();
                dialogs.proposition = quastion;
                var an0, an1, an2, an3 = null;
                if (answersOptions[0]) {
                    answersOptions[0].position = [20, 320, 300, 25];

                    an0 = new Answer(answersLayer, answersOptions[0])
                        .listenMouse()
                        .addEvent('click', function () {
                            answersOptions[0].method();
                            if (an0){
                                an0.removeEvent('click');
                                an0.removeEvent('mouseover');
                                an0.removeEvent('mouseout');
                                an0.display = false;
                            }
                            if (an1){
                                an1.removeEvent('click');
                                an1.removeEvent('mouseover');
                                an1.removeEvent('mouseout');
                                an1.display = false;
                            }
                            if (an2){
                                an2.removeEvent('click');
                                an2.removeEvent('mouseover');
                                an2.removeEvent('mouseout');
                                an2.display = false;
                            }
                            if (an3){
                                an3.removeEvent('click');
                                an3.removeEvent('mouseover');
                                an3.removeEvent('mouseout');
                                an3.display = false;
                            }
                        })
                        .addEvent('mouseover', function () {
                              dialogOver(this);
                          })
                        .addEvent('mouseout', function () {
                            dialogOut(this);
                        })
                    libcanvas.addElement(an0);
                }
                if (answersOptions[1]) {
                    answersOptions[1].position = [20, 345, 300, 25];

                    an1 = new Answer(answersLayer, answersOptions[1])
                        .listenMouse()
                        .addEvent('click', function () {
                            answersLayer.ctx.clearAll();
                            //console.log(answersOptions[1].method);
                            //preload(answersOptions[1].method);
                            answersOptions[1].method();
                            if (an0){
                                an0.removeEvent('click');
                                an0.removeEvent('mouseover');
                                an0.removeEvent('mouseout');
                                an0.display = false;
                            }
                            if (an1){
                                an1.removeEvent('click');
                                an1.removeEvent('mouseover');
                                an1.removeEvent('mouseout');
                                an1.display = false;
                            }
                            if (an2){
                                an2.removeEvent('click');
                                an2.removeEvent('mouseover');
                                an2.removeEvent('mouseout');
                                an2.display = false;
                            }
                            if (an3){
                                an3.removeEvent('click');
                                an3.removeEvent('mouseover');
                                an3.removeEvent('mouseout');
                                an3.display = false;
                            }
                        })
                        .addEvent('mouseover', function () {
                            dialogOver(this);
                        })
                        .addEvent('mouseout', function () {
                            dialogOut(this);
                        });
                    libcanvas.addElement(an1);
                }
                if (answersOptions[2]) {
                    answersOptions[2].position = [20, 370, 300, 25];

                    var an2 =  new Answer(answersLayer, answersOptions[2])
                        .listenMouse()
                        .addEvent('click', function () {
                            answersLayer.ctx.clearAll();
                            answersOptions[2].method();
                            if (an0){
                                an0.removeEvent('click');
                                an0.removeEvent('mouseover');
                                an0.removeEvent('mouseout');
                                an0.display = false;
                            }
                            if (an1){
                                an1.removeEvent('click');
                                an1.removeEvent('mouseover');
                                an1.removeEvent('mouseout');
                                an1.display = false;
                            }
                            if (an2){
                                an2.removeEvent('click');
                                an2.removeEvent('mouseover');
                                an2.removeEvent('mouseout');
                                an2.display = false;
                            }
                            if (an3){
                                an3.removeEvent('click');
                                an3.removeEvent('mouseover');
                                an3.removeEvent('mouseout');
                                an3.display = false;
                            }
                        })
                        .addEvent('mouseover', function () {
                            dialogOver(this);
                        })
                        .addEvent('mouseout', function () {
                            dialogOut(this);
                        });
                    libcanvas.addElement(an2);
                }
            }

            function dialogOut(t){
                t.textSize = 12;
                t.style = 'italic';
                atom.dom('.libcanvas-layers-container').css({
                    cursor   : 'default'
                });
            }
            function dialogOver(t){
                t.style = 'normal';
                t.textSize = 14;
                atom.dom('.libcanvas-layers-container').css({
                    cursor   : 'pointer'
                });
            }

        function run(){
            cistern.boom = false;
            interval = setInterval( function() {
                cCisterns.time = --p;
                if (p <= 0) {
                    //cistern.pos = [-100, -100];
                    end();
                }
            } , 1000);
        }

        function end(){
        	asteroid.pos = [-100, -100];
            cistern.pos = [-100, -100];
            trouble.pos = [-100, -100];
            asteroid.fly = false;
            ship.boom = true;

            ship.moving = false;
            asteroid.fly = false;
            //ship.playing = false;
            clearInterval(interval);

            var drawOptions = [
                {
                    text: ' - Мне нужен иструктаж!',
                    method : ignore
                },
                {
                    text: ' - Полетели!',
                    method : choseShip
                }
            ];
            var dialog = '  Мда, слабовато. Ты набрал всего лишь ' + cCisterns.num + ' очков!';
            dialog += '\n  Пробуй ещё, салага!';
            if (cCisterns.num > 15 && cistern.type == 'cistern') {

                dialog = '  Мда, слабовато. Ты набрал всего лишь ' + cCisterns.num + ' очков! Ех, была не была, готовся к следующему заданию.';
                dialog += '\n  Один наш "друг" не осилел доставку очень важного для нас товара. Видать его подбили и всё наше добро высыпалось в космос.';
                dialog += '\n  Ну я думаю ты уже догадался, что ты будеш собирать. Кхе-кхе-хе.';
                cistern.type = 'nark';
                ship.structure = 200;

            } else if (cCisterns.num > 30 && cistern.type == 'nark') {
                dialog = '  Мда, слабовато. Ты набрал всего лишь ' + cCisterns.num + ' очков! Думаю, ты всё ещё сможеш собрать больше товара...';
            }
            drawDialog(dialog, drawOptions);
            ship.moving = false;
            cistern.boom = true;

            dialogLayer.show();
            answersLayer.show();
        }

        /////////////////
        libcanvas.addFunc(function () {
            if (play) {
                if (this.getKey('aleft') && this.getKey('adown')){
                    if (ship.angle == 0) {
                        ship.angle = 360;
                    }
                    ship.angle += 10;
                    if (speed < forwardSpeed) {
                        forwardSpeed--;
                    }
                } else if (this.getKey('aleft' )) {
                    if (ship.angle == 0) {
                        ship.angle = 360;
                    }
                    ship.angle -= 10;
                    if (speed < forwardSpeed) {
                        forwardSpeed--;
                    }

                }
                if (this.getKey('aright') && this.getKey('adown')) {

                    if (ship.angle == 360) {
                        ship.angle = 0;
                    }
                    ship.angle -= 10;
                    if (speed < forwardSpeed) {
                        forwardSpeed--;
                    }
                } else if (this.getKey('aright')){
                    if (ship.angle == 360) {
                        ship.angle = 0;
                    }
                    ship.angle += 10;
                    if (speed < forwardSpeed) {
                        forwardSpeed--;
                    }
                }
                if (this.getKey('aup')) {
                    if (forwardSpeed < maxForwardSpeed) {
                        forwardSpeed++;
                    }
                    if (ship.angle < 90) {
                        ship.x = ship.x + forwardSpeed * Math.sin((ship.angle).degree());
                        ship.y = ship.y - forwardSpeed * Math.sin((90-ship.angle).degree());
                    } else if (90 <= ship.angle && ship.angle < 180) {
                        angle = ship.angle-90;
                        ship.x = ship.x + forwardSpeed * Math.sin((90-angle).degree());
                        ship.y = ship.y + forwardSpeed * Math.sin((angle).degree());
                    } else if (180 <= ship.angle && ship.angle < 270) {
                        angle = ship.angle-180;
                        ship.x = ship.x - forwardSpeed * Math.sin((angle).degree());
                        ship.y = ship.y + forwardSpeed * Math.sin((90-angle).degree());
                    } else if (ship.angle >= 270) {
                        angle = ship.angle-270;
                        ship.x = ship.x - forwardSpeed * Math.sin((90-angle).degree());
                        ship.y = ship.y - forwardSpeed * Math.sin((angle).degree());
                    }
                }
                if (this.getKey('adown' )) {
                    forwardSpeed = speed;
                    if (ship.angle < 90) {
                        ship.x = ship.x - backSpeed * Math.sin((ship.angle).degree());
                        ship.y = ship.y + backSpeed * Math.sin((90-ship.angle).degree());
                    } else if (90 <= ship.angle && ship.angle < 180) {
                        angle = ship.angle-90;
                        ship.x = ship.x - backSpeed * Math.sin((90-angle).degree());
                        ship.y = ship.y - backSpeed * Math.sin((angle).degree());
                    } else if (180 <= ship.angle && ship.angle < 270) {
                        angle = ship.angle-180;
                        ship.x = ship.x + backSpeed * Math.sin((angle).degree());
                        ship.y = ship.y - backSpeed * Math.sin((90-angle).degree());
                    } else if (ship.angle >= 270) {
                        angle = ship.angle-270;
                        ship.x = ship.x + backSpeed * Math.sin((90-angle).degree());
                        ship.y = ship.y + backSpeed * Math.sin((angle).degree());
                    }
                }

                if ((ship.x >= (cistern.pos[0]-40) && ship.x <= (cistern.pos[0] + 65))
                        && (ship.y >= (cistern.pos[1]-40) && ship.y <= (cistern.pos[1] + 65))) {
                    libcanvas.getAudio('buy').set({volume:0.1}).fade(250, 0.1, true).play();
                    cCisterns.num = ++cCisterns.num;
                    cistern.pos = [Number.random(40, canvasSize.x-40), Number.random(40, canvasSize.y-40)];
                }
                if (trouble.isTroubled([ship.x,ship.y])) {
                    if (ship.structure == 0) {
                        trouble.pos = [-100, -100];
                        cistern.pos = [-100, -100];
                        end();
                    } else {
                        //console.log('trable');
                        ship.structure -=1;
                        cCisterns.structure = ship.structure;
                    }
                }
                var impact = asteroid.isImpact([ship.x,ship.y]);
                if (impact) {
                	ship.structure -= Number.random(25, 50);
                	if (ship.structure > 0) {
                        cCisterns.structure = ship.structure;
                        ship.x += impact[0];
                        ship.y += impact[1];
                        ship.moving = false;
                        setTimeout(function(){ship.moving = true}, 500);
                    } else {
                        end();
                    }
                }
                this.update();
            }
        });
    }).update().listenMouse().listenKeyboard().show();
    play = true;
});

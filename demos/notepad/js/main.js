/**
 *
 * User: Alexander
 * Date: 11.02.14 0:06
 */

var contentArray = [];
var line = 0;
var $content;
var $notepad;
var $title;
var $fileMenu;
var $fileMenuButton;
var $viewMenu;
var $viewMenuButton;

var maxFileSize = 2048000;

$(function() {

    $content = $('#content');
    $notepad = $('#notepad');
    $title = $('#title');
    $fileMenu = $('#fileMenu');
    $fileMenuButton = $('#mainMenuLabelFile');
    $viewMenu = $('#viewMenu');
    $viewMenuButton = $('#mainMenuLabelView');

    $.get('content.txt', {}, function(data) {
        var tempArray = data.split('\n');
        for (var i in tempArray) {
            contentArray = contentArray.concat(tempArray[i].match(/\s*\S*/g));
            contentArray[contentArray.length - 1] = "\n";
        }
    });


    buildRecentlyMenu();

    $notepad.on('click', '.savedFile', function() {
        var $el = $(this);
        var encodedFileName = encodeURIComponent($el.text());
        var savedFiles = storage.getStorageData();
        if (savedFiles) {
            for (var fileName in savedFiles) {
                if (encodedFileName === fileName) {
                    var fileContent = savedFiles[fileName];
                    contentArray = [];
                    var tempArray = fileContent.split('\n');
                    for (var i in tempArray) {
                        contentArray = contentArray.concat(tempArray[i].match(/\s*\S*/g));
                        contentArray[contentArray.length - 1] = "\n";
                    }
                    line = 0;
                    $('#content').val('');
                    break;
                }
            }
        }
    });


    $content.keydown(function(e) {
        e.preventDefault();
        if (contentArray[line] !== undefined) {
            $content.val($('#content').val() + contentArray[line])
                .scrollTop(30 * line);
            line++;
        } else {
            $content.val('');
            line = 0;
        }
    });

    $fileMenuButton.click(function() {
        if ($fileMenuButton.hasClass('selected')) {
            $notepad.find('.selected').removeClass('selected');
        } else {
            $notepad.find('.selected').removeClass('selected');
            $fileMenuButton.addClass('selected');
            $fileMenu.addClass('selected');
        }
    });

    $viewMenuButton.click(function() {
        if ($viewMenuButton.hasClass('selected')) {
            $notepad.find('.selected').removeClass('selected');
        } else {
            $notepad.find('.selected').removeClass('selected');
            $viewMenuButton.addClass('selected');
            $viewMenu.addClass('selected');
        }
    });

    //Change locale
    $('#changeViewToEn').click(function() {
        loadCssFile("css/notepad_en.css");
    });

    $('#changeViewToRu').click(function() {
        loadCssFile("css/notepad_ru.css");
    });

    //Remove selections
    $(document).on("click", function(e) {
        if (!$(e.target).hasClass('selected') && $(e.target).parents('.selected').length === 0) {
            $notepad.find('.selected').removeClass('selected');
        }
    });


    $('#openFile').click(function() {
        $('#file').click();
    });

    $('#max').click(function() {
        $notepad.outerWidth($(window).width());
        $content.outerWidth($notepad.width());
        $title.outerWidth($notepad.width() - 190);

        $notepad.outerHeight($(window).height());
        $content.outerHeight($notepad.height() - 49);
    });


    $('#file').change(function(evt) {

        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            //Check type
            if (theFile.type !== "text/plain"
                && theFile.type !== "application/javascript"
                && theFile.type !== "text/css"
                && theFile.type !== "text/html"
                && theFile.type !== ""
                ) {
                alert('Incorrect file type "' + theFile.type + '". Allow only plain text.');
                return;
            }

            //Check size
            if (theFile.size > maxFileSize) {
                alert('Too big file.');
                return;
            }

            return function(e) {
                contentArray = [];
                var tempArray = e.target.result.split('\n');
                for (var i in tempArray) {
                    contentArray = contentArray.concat(tempArray[i].match(/\s*\S*/g));
                    contentArray[contentArray.length - 1] = "\n";
                }

                //Save
                var savedFiles = storage.getStorageData();
                if (savedFiles) {
                    savedFiles[encodeURIComponent(theFile.name)] = e.target.result;
                    storage.setStorageData(savedFiles);
                } else {
                    savedFiles = {};
                    savedFiles[encodeURIComponent(theFile.name)] = e.target.result;
                    storage.setStorageData(savedFiles);
                }

                buildRecentlyMenu();
                line = 0;
                $('#content').val('');
            };


        })(evt.target.files[0]);
        // Read in the file as a data URL.
        reader.readAsText(evt.target.files[0], 'utf-8');
    });

    $('.disabled').click(function(e) {
        e.stopPropagation();
    });

});

function loadCssFile(filename) {

    var link = document.createElement("link");
    link.setAttribute("rel", "stylesheet");
    link.setAttribute("type", "text/css");
    link.setAttribute("href", filename);

    if (typeof link != "undefined") {
        document.getElementsByTagName("head")[0].appendChild(link);
    }
}

(function loadTranslatedCss() {
    var language = (navigator.language) ? navigator.language : navigator.userLanguage;
    if (language.search(/ru/i) !== -1) {
        loadCssFile("css/notepad_ru.css");
    } else if (language.search(/ua/i) !== -1) {
        loadCssFile("css/notepad_ru.css");
    } else {
        loadCssFile("css/notepad_en.css");
    }
})();

function buildRecentlyMenu() {
    $('.savedFile').remove();
    var savedFiles = storage.getStorageData();
    if (savedFiles) {
        var html = '';
        for (var fileName in savedFiles) {
            html += '<li class="subMenuEl savedFile">' + decodeURIComponent(fileName) + '</li>';
        }
        $('#openFile').after(html);
    }
}

var storage = ({
    storageName: 'notepad',
    defaultData: [],
    getStorageData: function() {
        var storage = window.localStorage.getItem(this.storageName);
        if (storage) {
            return JSON.parse(storage);
        } else {
            return false;
        }
    },
    setStorageData: function(data) {
        window.localStorage.setItem(this.storageName, JSON.stringify(data));
    },
    setDefaultStorageData: function() {
        this.setStorageData(this.defaultData);
    },
    removeStorageData: function() {
        window.localStorage.removeItem(this.storageName);
    }

});
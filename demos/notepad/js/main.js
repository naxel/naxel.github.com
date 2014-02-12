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

$(function() {

    $content = $('#content');
    $notepad = $('#notepad');
    $title = $('#title');
    $fileMenu = $('#fileMenu');
    $fileMenuButton = $('#fileMenuButton');

    $.get('content.txt', {}, function(data) {
        var tempArray = data.split('\n');
        for (var i in tempArray) {
            contentArray = contentArray.concat(tempArray[i].match(/\s*\S*/g));
            contentArray[contentArray.length - 1] = "\n";
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

    $fileMenuButton.click(function(e) {
        stopPropagation(e);
        if ($fileMenuButton.hasClass('selected')) {
            $fileMenuButton.removeClass('selected');
            $fileMenu.removeClass('selected');
        } else {
            $fileMenuButton.addClass('selected');
            $fileMenu.addClass('selected');
        }
    });

    //Remove selections
    $(document).on("click", function() {
        $notepad.find('.selected').removeClass('selected');
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
            return function(e) {
                contentArray = [];
                var tempArray = e.target.result.split('\n');
                for (var i in tempArray) {
                    contentArray = contentArray.concat(tempArray[i].match(/\s*\S*/g));
                    contentArray[contentArray.length - 1] = "\n";
                }
                line = 0;
                $('#content').val('');
            };
        })(evt.target.files[0]);
        // Read in the file as a data URL.
        reader.readAsText(evt.target.files[0], 'utf-8');
    });

});

//Cancelling event
function stopPropagation(e) {
    if (e.stopPropagation) {
        e.stopPropagation()
    } else {
        e.cancelBubble = true
    }
}
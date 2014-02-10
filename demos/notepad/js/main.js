/**
 *
 * User: Alexander
 * Date: 11.02.14 0:06
 */

var contentArray = '';
var line = 0;
var $content;
var $notepad;
var $title;

$(function() {

    $content = $('#content');
    $notepad = $('#notepad');
    $title = $('#title');

    $.get('content.txt', {}, function(data) {
        contentArray = data.split('\n');
    });


    $content.keydown(function(e) {
        e.preventDefault();
        if (contentArray[line] !== undefined) {
            $content.val($('#content').val() + "\n" + contentArray[line])
                    .scrollTop(30 * line);
            line++;
        } else {
            $content.val('');
            line = 0;
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
        $content.outerHeight($notepad.height()-49);
    });


    $('#file').change(function(evt) {
        var reader = new FileReader();
        // Closure to capture the file information.
        reader.onload = (function(theFile) {
            return function(e) {
                contentArray = e.target.result.split('\n');
                line = 0;
                $('#content').val('');
            };
        })(evt.target.files[0]);
        // Read in the file as a data URL.
        reader.readAsText(evt.target.files[0], 'utf-8');
    });

});
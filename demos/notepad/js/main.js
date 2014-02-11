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

$(function() {

    $content = $('#content');
    $notepad = $('#notepad');
    $title = $('#title');

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
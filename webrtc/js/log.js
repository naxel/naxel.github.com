/**
 * User: naxel
 * Date: 04.03.13 13:11
 */
function __log(message) {
    console.log(message);
    var outputEl = $('#output');
    outputEl.text(outputEl.text() + message + "\n");
}

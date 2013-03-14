/**
 * User: naxel
 * Date: 22.02.13 13:55
 */
var getUserMedia = null;
var attachMediaStream = null;
var webrtcDetectedBrowser = null;

if (navigator.getUserMedia) {
    console.log("HTML5");//Opera
    getUserMedia = navigator.getUserMedia.bind(navigator);

    // Attach a media stream to an element.
    attachMediaStream = function (element, stream) {
        console.log("Attaching media stream");
        // @see https://developer.mozilla.org/en-US/docs/DOM/window.URL.createObjectURL
        if (window.URL) {
            element.src = URL.createObjectURL(stream);
        } else {
            element.src = stream;
        }

    };
} else if (navigator.mozGetUserMedia) {
    console.log("This appears to be Firefox");
    webrtcDetectedBrowser = "firefox";
    //in FF 19 need in about:config change media.navigator.enabled = enable
    getUserMedia = navigator.mozGetUserMedia.bind(navigator);

    // Attach a media stream to an element.
    attachMediaStream = function (element, stream) {
        console.log("Attaching media stream");

        if (window.URL) {
            element.mozSrcObject = stream;
        } else {
            element.src = URL.createObjectURL(stream);
        }
        element.play();
    };

    RTCPeerConnection = mozRTCPeerConnection;

    //RTCSessionDescription = mozRTCSessionDescription;
    RTCSessionDescription = function(sessionDescription){
        return sessionDescription;
    };
    RTCIceCandidate = mozRTCIceCandidate;

} else if (navigator.webkitGetUserMedia) {
    console.log("This appears to be Chrome");
    webrtcDetectedBrowser = "chrome";

    getUserMedia = navigator.webkitGetUserMedia.bind(navigator);

    // Attach a media stream to an element.
    attachMediaStream = function (element, stream) {
        console.log("Attaching media stream");
        if (window.URL) {
            element.src = URL.createObjectURL(stream);
        } else {
            element.src = webkitURL.createObjectURL(stream);
        }
    };

    if (!window.RTCPeerConnection) {
        RTCPeerConnection = webkitRTCPeerConnection;
    }

} else {
    alert("Browser does not appear to be WebRTC-capable");
}
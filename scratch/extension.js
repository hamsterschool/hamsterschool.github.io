(function(ext) {
    var device = null;
    ext._shutdown = function() {};

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };
    

	var poller = null;
function deviceOpened(dev) {
    // if device fails to open, forget about it
    if (dev == null) device = null;

    // otherwise start polling
    poller = setInterval(function() {
        rawData = device.read();
    }, 20);
};
ext._deviceConnected = function(dev) {
    if(device) return;

    device = dev;
    device.open(deviceOpened);
};

ext._deviceRemoved = function(dev) {
    if(device != dev) return;
    if(poller) poller = clearInterval(poller);
    device = null;
};

    var potentialDevices = [];
ext._deviceConnected = function(dev) {
    potentialDevices.push(dev);

    if (!device) {
        tryNextDevice();
    }
}

    var paramString = window.location.search.replace(/^\?|\/$/g, '');
    var vars = paramString.split('&');
    var lang = 'en';
    for(var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if(pair.length > 1 && pair[0] == 'lang')
            lang = pair[1];
    }
    alert(lang);

    // Block and block menu descriptions
    var descriptor = {
        blocks: [
            // Block type, block name, function name
            ["w", "move forward", "moveForward"],
		    ["w", "move backward", "moveBackward"],
		    ["w", "turn %m.left_right", "turn", "left"],
		    [" ", "set %m.left_right_both led to %m.color", "setLedTo", "left", "red"],
		    [" ", "clear %m.left_right_both led", "clearLed", "left"],
		    ["w", "beep", "beep"],
		    ["b", "hand found?", "handFound"]
        ],
        menus: {
		    "left_right": ["left", "right"],
		    "left_right_both": ["left", "right", "both"],
		    "color": ["red", "yellow", "green", "cyan", "blue", "magenta", "white"]
	    },
	    url: "http://hamster.school"
    };

    // Register the extension
    var serial_info = {type: 'serial'};
    ScratchExtensions.register('Hamster', descriptor, ext, serial_info);
})({});

(function(ext) {

    

    // Status reporting code
    // Use this to report missing hardware, plugin or unsupported browser
    ext._getStatus = function() {
        return {status: 2, msg: 'Ready'};
    };
    





//ext._deviceRemoved = function(dev) {
  //  if(device != dev) return;
    //if(poller) poller = clearInterval(poller);
//    device = null;
//};

    var connected = false;
    var device = null;
var poller2 = null;
function deviceOpened(dev) {
    // if device fails to open, forget about it
    if (dev == null) device = null;

    // otherwise start polling
    poller2 = setInterval(function() {
        rawData = device.read();
        console.log(rawData);
    }, 20);
};

//ext._deviceConnected = function(dev) {
  //  if(device) return;

    //device = dev;
    //device.open(deviceOpened);
//};
    ext._deviceRemoved = function(dev) {
        console.log('Device removed');
        // Not currently implemented with serial devices
    };

    var potentialDevices = [];
    ext._deviceConnected = function(dev) {
        console.log('connected');
        //if(device) return;
        potentialDevices.push(dev);
        if(!device)
            tryNextDevice();
    };

    var poller = null;
    var watchdog = null;
    function tryNextDevice() {
        device = potentialDevices.shift();
        if(!device) return;

        device.open({ stopBits: 0, bitRate: 115200, ctsFlowControl: 2 }, deviceOpened);
        console.log('connection3 with ' + device.id);
        
        device.set_receive_handler(function(data) {
            //var inputData = new Uint8Array(data);
            console.log('receive');
            //console.log(inputData);
            //processInput(inputData);
        });
        
        poller = setInterval(function() {
            //queryFirmware();
            if(device) {

//                device.send('FF\r');
            }
        }, 1000);

        watchdog = setTimeout(function() {
            clearInterval(poller2);
            poller2 = null;
            clearInterval(poller);
            poller = null;
            device.set_receive_handler(null);
            device.close();
            device = null;
            tryNextDevice();
        }, 5000);
    }

    ext._shutdown = function() {
        if(device) device.close();
        if(poller) clearInterval(poller);
        device = null;
    };

    var langs = {
        'ko': 'ko'
    };
    var vars = window.location.search.replace(/^\?|\/$/g, '').split("&");
    var lang = undefined;
    for(var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=');
        if(pair.length > 1 && pair[0] == 'lang')
            lang = pair[1];
    }
    if(!lang)
        lang = window.navigator.userLanguage || window.navigator.language;
    lang = langs[lang];
    if(lang == undefined)
        lang = 'en';
    //alert(lang);

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

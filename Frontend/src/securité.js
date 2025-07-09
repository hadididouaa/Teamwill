var noCopy = true;
var noPrint = true;
var noScreenshot = true;
var autoBlur = true;

if (noCopy) {
    document.body.oncopy = function () { return false; };
    document.body.oncontextmenu = function () { return false; };
    document.body.onselectstart = document.body.ondrag = function () {
        return false;
    };
    document.onkeydown = function (event) {
        if ((event.ctrlKey || event.metaKey) && (event.keyCode === 83 || event.code === "KeyS")) {
            event.preventDefault();
        }
    };
}

// 🛑 **Completely Block Printing**
if (noPrint) {
    // Hide page when trying to print (CSS)
    var cssNode3 = document.createElement('style');
    cssNode3.type = 'text/css';
    cssNode3.media = 'print';
    cssNode3.innerHTML = 'body { display: none !important; }';
    document.head.appendChild(cssNode3);

    // Prevent Ctrl + P
    document.addEventListener("keydown", (e) => {
        if (e.ctrlKey && e.key === "p") {
            e.preventDefault();
            e.stopImmediatePropagation();
            alert("Printing is disabled on this page!");
        }
    });

    // Disable the print dialog from being opened via JavaScript
    window.print = function () {
        alert("Printing is disabled on this website!");
        return false;
    };
}

var cssNode2 = document.createElement('style');
cssNode2.type = 'text/css';
cssNode2.media = 'screen';
cssNode2.innerHTML = `
    div { 
        -webkit-touch-callout: none;
        -webkit-user-select: none;
        -khtml-user-select: none;
        -moz-user-select: none;
        -ms-user-select: none;
        user-select: none;
    }
`;
document.head.appendChild(cssNode2);
document.body.style.cssText = `
    -webkit-touch-callout: none;
    -webkit-user-select: none;
    -khtml-user-select: none;
    -moz-user-select: none;
    -ms-user-select: none;
    user-select: none;
`;

function toBlur() {
    if (autoBlur) {
        document.body.style.cssText += `
            -webkit-filter: blur(5px);
            -moz-filter: blur(5px);
            -ms-filter: blur(5px);
            -o-filter: blur(5px);
            filter: blur(5px);
        `;
    }
}

function toClear() {
    document.body.style.cssText += `
        -webkit-filter: blur(0px);
        -moz-filter: blur(0px);
        -ms-filter: blur(0px);
        -o-filter: blur(0px);
        filter: blur(0px);
    `;
}

// 🛑 **Blackout Effect When Taking Screenshots**
function blackoutScreen() {
    var blackout = document.createElement("div");
    blackout.id = "blackoutScreen";
    blackout.style.position = "fixed";
    blackout.style.top = "0";
    blackout.style.left = "0";
    blackout.style.width = "100vw";
    blackout.style.height = "100vh";
    blackout.style.background = "black";
    blackout.style.zIndex = "99999";
    document.body.appendChild(blackout);

    setTimeout(() => {
        document.getElementById("blackoutScreen")?.remove();
    }, 2000);
}

// Detect PrintScreen key and apply blackout
document.addEventListener("keyup", (e) => {
    if (e.key === "PrintScreen") {
        if (noScreenshot) {
            navigator.clipboard.writeText('');
            blackoutScreen();
        }
    }
});

// Block PrintScreen via Clipboard Clearing
document.addEventListener("keydown", (e) => {
    if (e.key === "PrintScreen") {
        if (noScreenshot) {
            navigator.clipboard.writeText('');
            blackoutScreen();
        }
    }
});

// Blur content when tab is changed or out of focus
document.onmouseleave = function () {
    toBlur();
};
document.onblur = function () {
    toBlur();
};
document.onclick = function () {
    toClear();
};

// Detect screen recording (Basic Detection)
navigator.mediaDevices.ondevicechange = function () {
    alert("Screen recording detected! Your session may be monitored.");

};


// Disable right-click
document.addEventListener("contextmenu", (event) => event.preventDefault());


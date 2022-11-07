var socket;
var dingSound;
var messages = [];
var delay = true;

function onload() {
    socket = io();
    dingSound = document.getElementById("Ding");

    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const tileSize = 4;
    const palette = document.getElementById('palette');

    const colorMap = {
        "0": "#000000",
        "1": "#005500",
        "2": "#00ab00",
        "3": "#00ff00",
        "4": "#0000ff",
        "5": "#6495ed",
        "6": "#00abff",
        "7": "#00ffff",
        "8": "#ff0000",
        "9": "#ff5500",
        "10": "#ffab00",
        "11": "#ffff00",
        "12": "#6a0dad",
        "13": "#ff55ff",
        "14": "#ffabff",
        "15": "#ffffff"
    }

    const hexToName = {
        "#000000": "black",
        "#005500": "forest",
        "#00ab00": "green",
        "#00ff00": "lime",
        "#0000ff": "blue",
        "#6495ed": "cornflowerblue",
        "#00abff": "sky",
        "#00ffff": "cyan",
        "#ff0000": "red",
        "#ff5500": "burnt-orange",
        "#ffab00": "orange",
        "#ffff00": "yellow",
        "#6a0dad": "purple",
        "#ff55ff": "hot-pink",
        "#ffabff": "pink",
        "#ffffff": "white",
    }

    const nameToColor = {
        "black": "0",
        "forest": "1",
        "green": "2",
        "lime": "3",
        "blue": "4",
        "cornflowerblue": "5",
        "sky": "6",
        "cyan": "7",
        "red": "8",
        "burnt-orange": "9",
        "orange": "10",
        "yellow": "11",
        "purple": "12",
        "hot-pink": "13",
        "pink": "14",
        "white": "15"
    }

    var color = 'black';
    selectedPalette = palette.children[nameToColor[color]].style.borderColor = 'red'

    function getCursorPosition(canvas, event) {
        const rect = canvas.getBoundingClientRect()
        const x = Math.round((event.clientX - rect.left) / tileSize) - 1;
        const y = Math.round((event.clientY - rect.top) / tileSize) - 1;
        return { x: x, y: y }
    }

    function rgbToHex(r, g, b) {
        if (r > 255 || g > 255 || b > 255)
            throw "Invalid color component";
        return ((r << 16) | (g << 8) | b).toString(16);
    }

    canvas.addEventListener('mousedown', function(e) {
        let { x, y } = getCursorPosition(canvas, e)
        sendColor(x, y, color);
    })

    canvas.addEventListener('mousemove', function(e) {
        let { x, y } = getCursorPosition(canvas, e)
        var p = ctx.getImageData(tileSize * x + 2, tileSize * y, tileSize, tileSize).data
        var hex = "#" + ("000000" + rgbToHex(p[0], p[1], p[2])).slice(-6)
        document.getElementById('x-y').innerText = x + ", " + y + " | " + hexToName[hex];
    })

    function setColor(x, y, c) {
        ctx.fillStyle = colorMap[c];
        ctx.fillRect(tileSize * x + 2, tileSize * y, tileSize, tileSize);
    }

    function sendColor(x, y, c) {
        if (!socket) { return; }
        // use global color if not provided
        if (!c || !nameToColor[c]) { c = color; }
        let message = x + " " + y + " " + nameToColor[c]
        console.log("sending message!" + message)
        socket.emit("send", message);
    }

    socket.on("colorUpdate", function(message) {
        console.log("received" + message);
        var messages = message.split('\n');
        messages.forEach(message => {
            if (!message) {
                return
            }
            splitMessage = message.split(' ');
            if (splitMessage.length == 3) {
                setColor(splitMessage[0], splitMessage[1], splitMessage[2]);
            }
        });
    })

    const paletteSquares = document.getElementsByClassName("palette-square");

    for (let el of paletteSquares) {
        el.addEventListener("change", function(event) {
            if (event.target.checked) {
                const palette = document.getElementById('palette');
                palette.style.bordertop

                // uncheck previous color
                selectedPalette = palette.children[nameToColor[color]].style.borderTopColor = 'black'
                selectedPalette = palette.children[nameToColor[color]].style.borderLeftColor = 'black'
                selectedPalette = palette.children[nameToColor[color]].style.borderBottomColor = '#aaa'
                selectedPalette = palette.children[nameToColor[color]].style.borderRightColor = '#aaa'

                // select new color
                color = event.target.value
                selectedPalette = palette.children[nameToColor[color]].style.borderColor = 'red'
            }
        });
    }

    socket.emit("join");
}

function Send() {
    if (delay && messageInput.value.replace(/\s/g, "") != "") {
        delay = false;
        setTimeout(delayReset, 1000);
        socket.emit("send", messageInput.value);
        messageInput.value = "";
    }
}

function delayReset() {
    delay = true;
}
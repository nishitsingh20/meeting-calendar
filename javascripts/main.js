(function processParam() {
    constant = new constants();
    let parts = window.location.search.substring(1).split('&');
    for (let i = 0; i < parts.length; i++) {
        let nv = parts[i].split('=');
        if (nv[0] == 'case') {
            constant.dataUrl = "data/" + nv[1] + ".json";
        }
    }

    let xmlhttp = new XMLHttpRequest();

    xmlhttp.onreadystatechange = function() {
        if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
            let jsonData = JSON.parse(xmlhttp.responseText);
            let workCal = new posCalculator(jsonData);
            onScreenDisplay(workCal);
        }
    }
    xmlhttp.open("GET", constant.dataUrl, true);
    xmlhttp.send();
})();




(function scaleInit() {
    let scaleDiv = document.getElementById("scale");


    for (let i = 0; i <= constant.maxHeight; i += 2) {
        let line = document.createElement("div");
        if (i % 60 === 0) {
            line.style.width = "30px";
            line.style.left = "20px";
        } else {
            line.style.width = "10px";
            line.style.left = "40px";
        }
        line.style.height = "1px";
        line.style.backgroundColor = "#0D47A1";
        line.style.position = "absolute";
        line.style.top = i;

        scaleDiv.appendChild(line);

    }
})();

function dataValidate(start, end) {
    if (start >= end) {
        alert("Invalid Time : Data incorrect");
    }
}



function posCalculator(data) {

    //Data Validation

    data.forEach(function(data) {
        dataValidate(data.start, data.end);
    });

    //Final Data
    let meeting = [];

    for (var i = 0; i < data.length; i++) {
        var top = data[i].start * 2;
        var end = data[i].end * 2;
        var netHeight = end - top;

        meeting.push({
            id: data[i].id,
            height: netHeight,
            width: constant.maxWidth,
            top: top,
            left: 0,
            position: 0,
            start: data[i].start,
            end: data[i].end
        });
    }

    // Verify collisions between boxes

    for (var j = 0; j < meeting.length; j++) {

        var matchingNodes = [];
        for (var k = 0; k < meeting.length; k++) {
            if ((meeting[j].top <= meeting[k].top && (meeting[j].top + meeting[j].height) > meeting[k].top) && j != k || (meeting[j].top >= meeting[k].top && meeting[j].top < (meeting[k].top + meeting[k].height)) && j != k) {
                if (meeting[j].position === meeting[k].position) {
                    meeting[k].position++;
                }
                matchingNodes.push(k);
            }
        }

        if (meeting[j].position > 0) {
            for (var i = 0; i < matchingNodes.length; i++) {
                meeting[matchingNodes[i]].width = constant.maxWidth / (meeting[j].position + 1);
            }
            meeting[j].width = constant.maxWidth / (meeting[j].position + 1);

            for (var i = 0; i < matchingNodes.length; i++) {

                meeting[matchingNodes[i]].left = meeting[j].width * meeting[matchingNodes[i]].position;
            }

            meeting[j].left = meeting[j].width * meeting[j].position;

        }

    }

    return meeting;
}

function onScreenDisplay(data) {
    // Display on screen

    for (let i = 0; i < data.length; i++) {
        let divElement = document.createElement("div");

        //divElement.setAttibute("id",meeting[i].id); //jquery
        divElement.id = data[i].id;
        divElement.style.position = "absolute";
        divElement.style.top = data[i].top + "px";
        divElement.style.left = data[i].left + "px";
        divElement.style.width = data[i].width + "px";
        divElement.style.height = data[i].height + "px";
        divElement.style.borderStyle = "double";
        divElement.style.borderColor = "#90CAF9";
        divElement.style.backgroundColor = "#E3F2FD";
        //divElement.textContent = meeting[i].id + "   " + (9 + (Math.floor(data[i].start / 60))) + ":" + (Math.floor(data[i].start % 60)); //24hr format
        let start = timeCalculator(data[i].start);
        let end = timeCalculator(data[i].end);

        divElement.textContent = "Meeting " + (i + 1) + " : Start at " + start + " and ends at " + end;

        document.getElementById("cal").appendChild(divElement);
    }
}

function timeCalculator(time) {

    let hr, periods, min;

    if ((9 + (Math.floor(time / 60))) <= 12) {
        hr = (9 + (Math.floor(time / 60)));
        periods = " AM";
    } else {
        hr = (9 + (Math.floor(time / 60))) % 12;
        periods = " PM";
    }
    if ((Math.floor(time % 60)) < 10) {
        min = (Math.floor(time % 60)) + "0";
    } else {
        min = (Math.floor(time % 60));
    }
    let currentTime = hr + ":" + min + periods;

    return currentTime;
}
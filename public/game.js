var player_score = document.getElementById("score").innerHTML;
var position = 0
var rotation = 0

var bot_name = null
var position_bot = 0
var rotation_bot = 0
var status = 'Selecting'

var mag = new Array(1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12)
var point = '';
var switch_time = Math.round(Math.random() * 3000 + 3000);
var game_start = false;
var current_pic = 1


function SetPosition(num) {
    position = num;
}

function SetRotation() {
	var num = document.getElementById('rotation_num').value;
    rotation = num;
}

function BotSelect() {
    while (position_bot == 0) {
        position_bot = Math.round(Math.random() * 12);
    }
    while (rotation_bot == 0) {
        rotation_bot = Math.round(Math.random() * 11);
    }
}
BotSelect()


function GenBotName() {
    var index = Math.round(Math.random() * 50);
    document.getElementById("bot_name").innerHTML = `Bot #${index}`
}
GenBotName()


function Check() {
    SetRotation()
    if (position == 0) {
        alert('Select a Number on the roulette')
        return
    } else if (rotation == 0) {
        alert('Select a Number from the list on the right')
        return
    }
    StartGame()
}

function ApplyMask() {
    var mask = document.getElementById("mask");
    mask.style.height = '720px';
    mask.style.width = '720px';

    var mask2 = document.getElementById("mask2");
    mask2.style.height = '360px';
    mask2.style.width = '360px';
}

function HideMask() {
    var mask = document.getElementById("mask");
    mask.style.height = '0px';
    mask.style.width = '0px';

    var mask2 = document.getElementById("mask2");
    mask2.style.height = '0px';
    mask2.style.width = '0px';
}

function Spin(num) {

}

function AddScore() {

}


function point_adding() {
    if (point != '.......') {
        point = point + '.'
    } else {
        point = ''
    }
    setTimeout("point_adding()", 300);
}
point_adding()


function WriteBotStatus() {
    if (game_start == false) {
        document.getElementById("status").innerHTML = `${status}${point}`
        var write = setTimeout('WriteBotStatus()', 100);
    } else {
        clearTimeout(write)
        document.getElementById("status").innerHTML = ''
    }
    
}

function ChangeStatus() {
    setTimeout(() => {status = 'Waiting'}, switch_time);
}

setTimeout('WriteBotStatus(ChangeStatus())', 3000);





function StartGame() {
    game_start = true
    console.log(position_bot);
    console.log(rotation_bot);

    ApplyMask()


}
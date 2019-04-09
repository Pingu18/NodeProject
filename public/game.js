var player_score = document.getElementById("score").innerHTML;
var position = 0
var rotation = 0

var bot_name = null
var position_bot = 0
var rotation_bot = 0


function SetPosition(num) {
    position = num;
}

function SetRotation() {
	var num = document.getElementById('rotation_num').value;
    rotation = num;
}

function BotSelect() {
    while (position_bot == 0) {
        position_bot = Math.round(Math.random() * 11);
    }
    while (rotation_bot == 0) {
        rotation_bot = Math.round(Math.random() * 11);
    }
}

setTimeout('BotSelect()', 5000);





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

function StartGame() {
    console.log(position);
    console.log(rotation);
    ApplyMask()
}
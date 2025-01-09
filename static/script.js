document.getElementById('startButton').onclick = function() {
    // 게임 시작 로직을 여기에 추가합니다.
    window.location.href = window.location.href+"mine1";
};

document.getElementById('instructionsButton').onclick = function() {
    document.getElementById('instructions').style.display = 'block';
};

document.getElementById('closeInstructionsButton').onclick = function() {
    document.getElementById('instructions').style.display = 'none';
};

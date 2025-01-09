document.getElementById("countset").value = 10;
document.getElementById("tableWidthset").value = 10;
document.getElementById("tableHeightset").value = 10;

let rows = Number(document.getElementById("tableHeightset").value); // 열 행 지뢰숫자
let cols = Number(document.getElementById("tableWidthset").value);
let mineCount = Number(document.getElementById("countset").value);
let minefield = [];
let revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
let timerInterval;
let totalTime = 0;

function initializeGame() {
    // 새로운 설정값으로 변수 초기화
    rows = Number(document.getElementById("tableHeightset").value);
    cols = Number(document.getElementById("tableWidthset").value);
    mineCount = Number(document.getElementById("countset").value);

    minefield = Array.from({ length: rows }, () => Array(cols).fill(0));
    revealed = Array.from({ length: rows }, () => Array(cols).fill(false));
    totalTime = 0; // 타이머 초기화
    updateTimerDisplay();
    clearInterval(timerInterval); // 이전 타이머 중지
    startTimer(); // 새 타이머 시작

    // 지뢰 배치
    let minesPlaced = 0;
    while (minesPlaced < mineCount) {
        const row = Math.floor(Math.random() * rows);
        const col = Math.floor(Math.random() * cols);
        if (minefield[row][col] !== -1) {
            minefield[row][col] = -1;
            minesPlaced++;
            incrementNeighbors(row, col);
        }
    }

    render();
}

function startTimer() {
    timerInterval = setInterval(() => {
        totalTime++;
        updateTimerDisplay();
    }, 1000);
}

function updateTimerDisplay() {
    const minutes = Math.floor(totalTime / 60);
    const seconds = totalTime % 60;
    document.getElementById('timer').innerText =
        String(minutes).padStart(2, '0') + ':' + String(seconds).padStart(2, '0');
}

function incrementNeighbors(row, col) {
    for (let r = -1; r <= 1; r++) {
        for (let c = -1; c <= 1; c++) {
            if (r === 0 && c === 0) continue;
            const newRow = row + r;
            const newCol = col + c;
            if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && minefield[newRow][newCol] !== -1) {
                minefield[newRow][newCol]++;
            }
        }
    }
}

function render() {
    const table = document.getElementById('minefield');
    table.innerHTML = '';
    for (let row = 0; row < rows; row++) {
        const tr = document.createElement('tr');
        for (let col = 0; col < cols; col++) {
            const td = document.createElement('td');
            td.onclick = () => revealCell(row, col);
            if (revealed[row][col]) {
                td.classList.add('revealed');
                if (minefield[row][col] === -1) {
                    td.classList.add('mine');
                    td.innerText = '💣';
                } else {
                    td.innerText = minefield[row][col] > 0 ? minefield[row][col] : '';
                }
            }
            tr.appendChild(td);
        }
        table.appendChild(tr);
    }
}

function revealCell(row, col) {
    if (revealed[row][col]) return; // 이미 밝혀진 셀은 무시
    revealed[row][col] = true;

    if (minefield[row][col] === -1) {
        clearInterval(timerInterval); // 타이머 중지
        alert('게임 오버!');
        document.getElementById('game-over').style.display = 'block'; // 게임 오버 창 표시
        render();
        return;
    }

    if (minefield[row][col] === 0) {
        // 빈 셀일 경우 인접 셀도 밝히기
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const newRow = row + r;
                const newCol = col + c;
                if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols) {
                    revealCell(newRow, newCol);
                }
            }
        }
    }

    render();
    checkWin(); // 게임 승리 조건 체크
}


// 게임 승리 조건 추가
function checkWin() {
    const totalCells = rows * cols;
    const revealedCells = revealed.flat().filter(r => r).length;
    if (revealedCells === totalCells - mineCount) {
        clearInterval(timerInterval); // 타이머 중지
        alert('축하합니다! 게임을 완료했습니다!');
        document.getElementById('game-clear').style.display = 'block';
        render();
    }
}

// 순위 불러오기
function loadRankings() {
    const rankingsDiv = document.getElementById('rankings');
    
    // 서버에서 순위 가져오기
    fetch('/get-scores')
        .then(response => response.json())
        .then(rankings => {
            rankingsDiv.innerHTML = rankings.length > 0 
                ? rankings.map((rank, index) => `<p>${index + 1}. ${rank.name} - ${rank.time}초</p>`).join('')
                : '<p>순위가 없습니다.</p>';
        })
        .catch(error => console.error('Error fetching rankings:', error));
}


// 점수 제출 처리
document.getElementById('submit-score').onclick = () => {
    const playerName = document.getElementById('player-name').value;
    if (playerName) {
        const newScore = { name: playerName, time: totalTime };

        // 서버에 점수 제출
        fetch('/submit-score', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newScore)
        })
        .then(response => response.json())
        .then(data => {
            console.log(data.message); // 서버 응답 처리
            loadRankings(); // 순위 다시 불러오기
            document.getElementById('player-name').value = ''; // 입력 필드 초기화
        })
        .catch(error => console.error('Error:', error));
    }
    initializeGame();
    document.getElementById('game-clear').style.display = 'none';
};

// 초기화 버튼 클릭 시 게임 초기화
document.getElementById('reset').onclick = initializeGame;
document.getElementById('reset1').onclick = () => {
    initializeGame();
    document.getElementById('game-over').style.display = 'none';
}

//환경설정
const colorPicker = document.getElementById('colorPicker');
const setColorBtn = document.getElementById('setColorBtn');
const gradientCheckbox = document.getElementById('gradientCheckbox');

setColorBtn.addEventListener('click', () => {
    const selectedColor = colorPicker.value;

    if (gradientCheckbox.checked) {
        // 그라데이션 적용
        document.body.style.background = `linear-gradient(to bottom, ${selectedColor}, #ffffff)`;
    } else {
        // 단색 배경 적용
        document.body.style.background = `linear-gradient(to bottom, ${selectedColor}, ${selectedColor})`;
    }
});

// 페이지가 로드될 때 순위를 불러오기
document.addEventListener('DOMContentLoaded', () => {
    initializeGame(); // 게임 초기화
    loadRankings();
});

function resetRankings() { //순위 초기화
    localStorage.removeItem('rankings');
}


document.getElementById("icon").onclick = function() {
    document.getElementById("setting-modal").style.display = 'block';
}

document.getElementById("setclose").onclick = () => {
    mineCount = document.getElementById("countset").value;
    cols = document.getElementById("tableWidthset").value;
    rows = document.getElementById("tableHeightset").value;
    initializeGame();
    document.getElementById("setting-modal").style.display = 'none';
}
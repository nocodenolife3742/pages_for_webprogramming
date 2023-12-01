const canvas = document.getElementById('tetris');
const context = canvas.getContext('2d');
const pattern = {
    1: [[0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0],
        [0, 1, 0, 0]],
    2: [[0, 2, 0],
        [0, 2, 0],
        [2, 2, 0]],
    3: [[3, 3],
        [3, 3]],
    4: [[0, 4, 0],
        [4, 4, 0],
        [4, 0, 0]],
    5: [[0, 5, 0],
        [5, 5, 5],
        [0, 0, 0]],
};
let board = Array.from(Array(20), () => new Array(10).fill(0));
let Pause = false;
let Intervals = [];
let active_block = [];
let is_dragging = false;
let score = 0;
let drag_x;
let drag_y;

function is_GameOver() {
    for (let layer = 0; layer < 4; layer++) {
        for (let i = 0; i < 10; i++) {
            if (board[layer][i] !== 0)
                return true;
        }
    }
    return false;
}

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min);
}

function Block(id) {
    this.id = id;
    this.pattern = pattern[id];
    this.offset_i = 0;
    this.offset_j = 3;
    this.is_click = false;
    this.is_valid = function () {
        for (let i = 0; i < this.pattern.length; i++) {
            for (let j = 0; j < this.pattern[0].length; j++) {
                if (this.pattern[i][j] === 0)
                    continue;
                let actual_i = i + this.offset_i;
                let actual_j = j + this.offset_j;
                if (actual_i < 0 || actual_i >= 20 || actual_j < 0 || actual_j >= 10)
                    return false;
                if (board[actual_i][actual_j] !== 0)
                    return false;
            }
        }
        return true;
    }
    this.touch_down = function () {
        for (let i = 0; i < this.pattern.length; i++) {
            for (let j = 0; j < this.pattern[0].length; j++) {
                if (this.pattern[i][j] === 0)
                    continue;
                let actual_i = i + this.offset_i;
                let actual_j = j + this.offset_j;
                if (actual_i === 19)
                    return true;
                if (board[actual_i + 1][actual_j] !== 0)
                    return true;
            }
        }
        return false;
    }
    this.rotate = function () {
        let new_pattern = Array.from(Array(this.pattern.length), () => new Array(this.pattern[0].length).fill(0));
        for (let i = 0; i < this.pattern.length; i++) {
            for (let j = 0; j < this.pattern[0].length; j++) {
                new_pattern[i][j] = this.pattern[this.pattern.length - 1 - j][i];
            }
        }
        [new_pattern, this.pattern] = [this.pattern, new_pattern];
        if (!this.is_valid()) {
            this.pattern = new_pattern;
        }
    }
    this.move_left = function () {
        this.offset_j--;
        if (!this.is_valid())
            this.offset_j++;
    }
    this.move_right = function () {
        this.offset_j++;
        if (!this.is_valid())
            this.offset_j--;
    }
    this.move_down = function () {
        this.offset_i++;
        if (!this.is_valid())
            this.offset_i--;
    }
    this.move_up = function () {
        this.offset_i--;
        if (!this.is_valid())
            this.offset_i++;
    }
    this.check_is_click = function (x, y) {
        for (let i = 0; i < this.pattern.length; i++) {
            for (let j = 0; j < this.pattern[0].length; j++) {
                if (this.pattern[i][j] === 0)
                    continue;
                let actual_i = i + this.offset_i;
                let actual_j = j + this.offset_j;
                if (350 + actual_j * 30 <= x && x <= 380 + actual_j * 30 && 50 + actual_i * 30 <= y && y <= 80 + actual_i * 30) {
                    this.is_click = true;
                    return true;
                }
            }
        }
        this.is_click = false;
        return false;
    }
}

function add_new_block() {
    let id = getRandomInt(1, 6);
    active_block.push(new Block(id));
}

function clear_board() {
    let cnt = 0;
    const add_score = [0, 100, 300, 700, 1500];
    for (let times = 0; times < 4; times++) {
        for (let i = 0; i < 20; i++) {
            let is_full = true;
            for (let j = 0; j < 10; j++) {
                if (board[i][j] === 0) {
                    is_full = false;
                    break;
                }
            }
            if (is_full) {
                for (let j = i; j > 0; j--) {
                    for (let k = 0; k < 10; k++) {
                        board[j][k] = board[j - 1][k];
                    }
                }
                cnt++;
            }
        }
    }
    score += add_score[cnt];
}

function move_down_active_block() {
    let remove_index = [];
    for (let i = 0; i < active_block.length; i++) {
        if (active_block[i].touch_down()) {
            remove_index.push(i);
        }
    }

    for (let idx = 0; idx < remove_index.length; idx++) {
        let n = remove_index[idx];
        for (let i = 0; i < active_block[n].pattern.length; i++) {
            for (let j = 0; j < active_block[n].pattern[0].length; j++) {
                if (active_block[n].pattern[i][j] === 0)
                    continue;
                board[i + active_block[n].offset_i][j + active_block[n].offset_j] = active_block[n].id;
            }
        }
        if (is_GameOver()) {
            pause_game();
            alert("Game Over\nYour Score : " + score);
        }
        clear_board();
    }

    for (let i = remove_index.length - 1; i >= 0; i--) {
        active_block.splice(remove_index[i], 1);
    }

    for (let i = 0; i < active_block.length; i++) {
        active_block[i].move_down();
        if (!active_block[i].is_valid())
            active_block[i].offset_i--;
    }
}

function clear_canvas() {
    context.clearRect(0, 0, canvas.width, canvas.height);
}

function draw_background() {
    context.fillStyle = 'rgba(205, 245, 253, 1)';
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = 'rgba(0, 0, 0, 0.3)';
    context.fillRect(350, 50, 300, 600);
}

function draw_score() {
    context.fillStyle = "rgb(0,0,0,0.25)";
    context.font = "bold 40px 'Noto Serif'";
    let digit = score.toString().length + 8;
    context.fillText("Score : " + score, 500 - digit * 10, 350);
}

function draw_grid() {
    const grid_size = 30;

    context.strokeStyle = "rgba(160, 233, 255, 0.3)";
    context.lineWidth = 1.5;
    for (let i = 1; i < 20; i++) {
        context.beginPath();
        context.moveTo(350, 50 + i * grid_size);
        context.lineTo(650, 50 + i * grid_size);
        context.closePath();
        context.stroke();
    }
    for (let i = 1; i < 10; i++) {
        context.beginPath();
        context.moveTo(350 + i * grid_size, 50);
        context.lineTo(350 + i * grid_size, 650);
        context.closePath();
        context.stroke();
    }

    context.strokeStyle = "rgb(0,0,0)";
    context.beginPath();
    context.moveTo(350, 50);
    context.lineTo(350, 650);
    context.lineTo(650, 650);
    context.lineTo(650, 50);
    context.stroke();
}

function draw_game_board(game_board) {
    const color = {
        1: "rgb(62, 219, 161)",
        2: "rgb(219, 121, 61)",
        3: "rgb(219, 187, 62)",
        4: "rgb(161, 219, 62)",
        5: "rgb(204, 78, 191)",
    };
    for (let i = 0; i < 20; i++) {
        for (let j = 0; j < 10; j++) {
            if (game_board[i][j] !== 0) {
                context.fillStyle = color[game_board[i][j]];
                context.fillRect(350 + j * 30, 50 + i * 30, 30, 30);
                context.strokeStyle = "rgb(0,0,0)";
                context.strokeWidth = 1.5;
                context.strokeRect(350 + j * 30, 50 + i * 30, 30, 30);
                context.strokeStyle = "rgba(0,0,0,0.15)";
                context.strokeRect(357.5 + j * 30, 57.5 + i * 30, 15, 15);
            }
        }
    }
}

function draw_active_block() {
    const color = {
        1: "rgb(62, 219, 161)",
        2: "rgb(219, 121, 61)",
        3: "rgb(219, 187, 62)",
        4: "rgb(161, 219, 62)",
        5: "rgb(204, 78, 191)",
    };
    for (let i = 0; i < active_block.length; i++) {
        for (let j = 0; j < active_block[i].pattern.length; j++) {
            for (let k = 0; k < active_block[i].pattern[0].length; k++) {
                if (active_block[i].pattern[j][k] === 0)
                    continue;
                context.fillStyle = color[active_block[i].id];
                context.fillRect(350 + (k + active_block[i].offset_j) * 30, 50 + (j + active_block[i].offset_i) * 30, 30, 30);
                context.strokeStyle = "rgb(0,0,0)";
                context.lineWidth = 1.5;
                if (active_block[i].is_click) {
                    context.strokeStyle = "rgb(255,0,0)";
                    context.lineWidth = 3.5;
                }
                context.strokeRect(350 + (k + active_block[i].offset_j) * 30, 50 + (j + active_block[i].offset_i) * 30, 30, 30);
                context.strokeStyle = "rgba(0,0,0,0.15)";
                context.lineWidth = 1.5;
                context.strokeRect(357.5 + (k + active_block[i].offset_j) * 30, 57.5 + (j + active_block[i].offset_i) * 30, 15, 15);
            }
        }
    }
}

function draw_death_line() {
    context.strokeStyle = "rgb(255,0,0)";
    context.strokeWidth = 1.5;
    context.beginPath();
    context.moveTo(350, 170);
    context.lineTo(650, 170);
    context.stroke();

}

function update_canvas() {
    clear_canvas();
    draw_background();
    draw_score();
    draw_grid();
    draw_game_board(board);
    draw_active_block();
    draw_death_line();
    requestAnimationFrame(update_canvas);
}

function init_variables() {
    board = Array.from(Array(20), () => new Array(10).fill(0));
    Pause = false;
    Intervals = [];
    active_block = [];
    is_dragging = false;
    drag_x = 0;
    drag_y = 0;
    score = 0;
}

function set_intervals() {
    Intervals.push(setInterval(move_down_active_block, 1000));
    Intervals.push(setInterval(add_new_block, 5000));
}

function clear_intervals() {
    for (let i = 0; i < Intervals.length; i++) {
        clearInterval(Intervals[i]);
    }
    Intervals = [];
}

function start_game() {
    if (!Pause && !is_GameOver())
        return;
    Pause = false;
    clear_intervals();
    set_intervals();
}

function reset_game() {
    clear_intervals();
    init_variables();
    add_new_block();
    set_intervals();
}

function pause_game() {
    if (Pause)
        return;
    Pause = true;
    clear_intervals();
}

requestAnimationFrame(update_canvas);

document.addEventListener("keydown", (event) => {
    if (event.key === "ArrowLeft" || event.key === "a") {
        if (Pause)
            return;
        for (let i = 0; i < active_block.length; i++) {
            if (active_block[i].is_click)
                active_block[i].move_left();
        }
        console.log(active_block);
    }
    if (event.key === "ArrowRight" || event.key === "d") {
        if (Pause)
            return;
        for (let i = 0; i < active_block.length; i++) {
            if (active_block[i].is_click)
                active_block[i].move_right();
        }
    }
    if (event.key === "ArrowUp" || event.key === "w") {
        if (Pause)
            return;
        for (let i = 0; i < active_block.length; i++) {
            if (active_block[i].is_click)
                active_block[i].rotate();
        }
    }
})
document.getElementById("start").addEventListener("click", start_game);
document.getElementById("pause").addEventListener("click", pause_game);
document.getElementById("reset").addEventListener("click", reset_game);
document.getElementById("move-left").addEventListener("click", () => {
    if (Pause)
        return;
    for (let i = 0; i < active_block.length; i++) {
        if (active_block[i].is_click)
            active_block[i].move_left();
    }
})
document.getElementById("move-right").addEventListener("click", () => {
    if (Pause)
        return;
    for (let i = 0; i < active_block.length; i++) {
        if (active_block[i].is_click)
            active_block[i].move_right();
    }
})
document.getElementById("rotate").addEventListener("click", () => {
    if (Pause)
        return;
    for (let i = 0; i < active_block.length; i++) {
        if (active_block[i].is_click)
            active_block[i].rotate();
    }
})
canvas.onmousedown = (event) => {
    let offset_x = canvas.offsetLeft;
    let offset_y = canvas.offsetTop;
    let x = event.clientX - offset_x;
    let y = event.clientY - offset_y;
    is_dragging = true;

    let old_click_index = -1;

    for (let i = 0; i < active_block.length; i++) {
        if (active_block[i].is_click) {
            old_click_index = i;
        }
    }

    for (let i = 0; i < active_block.length; i++) {
        if (active_block[i].check_is_click(x, y)) {
            if (old_click_index !== -1 && old_click_index !== i) {
                active_block[old_click_index].is_click = false;
            }
        }
    }
    drag_x = x;
    drag_y = y;
}
canvas.onmouseup = (event) => {
    event.preventDefault();
    is_dragging = false;
}
canvas.onmousemove = (event) => {
    if (!is_dragging || Pause)
        return;
    let offset_x = canvas.offsetLeft;
    let offset_y = canvas.offsetTop;
    let now_x = event.clientX - offset_x;
    let now_y = event.clientY - offset_y;
    let index = -1;

    for (let i = 0; i < active_block.length; i++) {
        if (active_block[i].is_click) {
            index = i;
        }
    }

    if (index === -1)
        return;

    let board = Array.from(Array(20), () => new Array(10).fill(0));
    for (let i = 0; i < active_block.length; i++) {
        if (i === index)
            continue;
        for (let j = 0; j < active_block[i].pattern.length; j++) {
            for (let k = 0; k < active_block[i].pattern[0].length; k++) {
                if (active_block[i].pattern[j][k] === 0)
                    continue;
                let actual_i = j + active_block[i].offset_i;
                let actual_j = k + active_block[i].offset_j;
                board[actual_i][actual_j] = 1;
            }
        }
    }

    function is_collide() {
        for (let j = 0; j < active_block[index].pattern[0].length; j++) {
            for (let k = 0; k < active_block[index].pattern.length; k++) {
                if (active_block[index].pattern[k][j] === 0)
                    continue;
                let actual_i = k + active_block[index].offset_i;
                let actual_j = j + active_block[index].offset_j;
                if (board[actual_i][actual_j] === 1) {
                    active_block[index].is_click = false;
                    return true;
                }
            }
        }
        return false;
    }

    if (now_x > drag_x + 30) {
        active_block[index].move_right();
        if (is_collide())
            active_block[index].move_left();
        drag_x += 30;
    } else if (now_x < drag_x - 30) {
        active_block[index].move_left();
        if (is_collide())
            active_block[index].move_right();
        drag_x -= 30;
    }
    if (now_y > drag_y + 30) {
        active_block[index].move_down();
        if (is_collide())
            active_block[index].move_up();
        drag_y += 30;
    }
    if (now_y < drag_y - 30) {
        active_block[index].move_up();
        if (is_collide())
            active_block[index].move_down();
        drag_y -= 30;
    }


}
canvas.onmouseleave = (event) => {
    event.preventDefault();
    is_dragging = false;
}



reset_game();
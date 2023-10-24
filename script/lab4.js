function changeWidth(width) {
    document.getElementById("table").style.width = width + "px";
}

function changeBorderWidth(pixel) {
    let header_cell = document.getElementsByClassName("header_cell")
    for (let i = 0; i < header_cell.length; i++) {
        header_cell[i].style.border = pixel + "px solid black";
    }
    let normal_cell = document.getElementsByClassName("normal_cell");
    for (let i = 0; i < normal_cell.length; i++) {
        normal_cell[i].style.border = pixel + "px solid black";
    }
}

function changeBackgroundColor(color) {
    let normal_cell = document.getElementsByClassName("normal_cell");
    for (let i = 0; i < normal_cell.length; i++) {
        normal_cell[i].style.backgroundColor = color;
    }
}

function resetStyle() {
    changeWidth(200);
    changeBorderWidth(1);
    changeBackgroundColor('#f5f5f5');
}
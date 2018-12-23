var blockZone = [[false, false], [false, false]];
function c2bz(x, y) {
    if (x) { x = 1 } else { x = 0 }
    if (y) { y = 1 } else { y = 0 }
    return blockZone[x][y];
}
function block(x, y) {
    if (x) { x = 1 } else { x = 0 }
    if (y) { y = 1 } else { y = 0 }
    // //////console.log(x + " " + y);
    if (blockZone[x][y]) {
        blockZone[x][y] = false;
    } else {
        blockZone[x][y] = true;
    }
    console.log("aa")
}
function qblock(posi, dir, j) {
    var a = true;
    var b = false;
    if (posi == 1) {
        a = !a;
    }
    if (posi == 2) {
        a = !a;
        b = !b;
    }
    if (posi == 3) {
        b = !b;
    }

    if (j == 0 || j == 1) {
        block(a, !b);
        console.log(1)
        if (j == 0) return;
    }
    if (dir == 2) {
        return;
    } else {
        if (j == 1 || j == 2) {
            la = a;
            lb = b;
            if (posi == 2) {
                la = !la;
                lb = !lb;
            }
            block(la, lb);
            console.log(2)
            if (j == 1) return;
        }
        if (dir == 1) {
            console.log(3)
            block(!a, b);
        }
    }
}
function blocked(posi, dir, j) {
    var a = true;
    var b = false;
    if (posi == 1) {
        b = true;
    }
    if (posi == 2) {
        a = false;
        b = true;
    }
    if (posi == 3) {
        a = false;
    }

    if (j == 0) {
        return c2bz(a, !b);
    }
    if (dir == 2) {
        return false;
    } else {
        if (j == 1) {
            la = a;
            lb = b;
            if (posi == 1 || posi == 3) {
                la = !la;
                lb = !lb;
            }
            return c2bz(la, lb);
        }
        if (dir == 1) {
            return c2bz(!a, b)
        }
    }
    return false;
}
var blockZoneClear = () => {
    if (!blockZone[0].includes(true) && !blockZone[1].includes(true)) {
        return true;
    } else {
        return false;
    }
}
for (i = 0; i < 4; i++) {
    qblock(2, 1, i);
    console.log(blockZone);
}
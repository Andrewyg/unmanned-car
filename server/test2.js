function keyLeft(x = mostName[0]) {
    x = x - 1;
    if (x < 0) x + 4;
    return x;
}
function keyOpp(x = mostName[0]) {
    x = x - 2;
    if (x < 0) x + 4;
    return x;
}
function keyRight(x = mostName[0]) {
    x = x + 1;
    console.log(x)
    if (x > 3) {
        console.log("in")
        x -= 4;
    }
    return x;
}
console.log(keyRight(3));
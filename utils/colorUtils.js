const GREAT = "&2";
const GOOD = "&a";
const MEDIOCRE = "&e";
const BAD = "&c";
const TERRIBLE = "&4";

const colorMap = [
    GREAT,
    GOOD,
    MEDIOCRE,
    BAD,
    TERRIBLE
];

function getCoinsColor(profit) {
    return profit >= 10_000_000 ? GREAT : profit >= 5_000_000 ? GOOD : profit >= 2_500_000 ? MEDIOCRE : profit >= 1_000_000 ? BAD : TERRIBLE;
}

function getVolumeColor(volume) {
    return volume >= 30 ? GREAT : volume >= 20 ? GOOD : volume >= 10 ? MEDIOCRE : volume >= 5 ? BAD : TERRIBLE;
}

function getAmountColor(amount) {
    return amount <= 16 ? GREAT : amount <= 32 ? GOOD : amount <= 64 ? MEDIOCRE : amount <= 128 ? BAD : TERRIBLE;
}

function reverse(color) {
    const colorIndex = colorMap.indexOf(color);
    if (colorIndex === -1) return MEDIOCRE;

    const reverseIndex = colorMap.length - 1 - colorIndex;
    return colorMap[reverseIndex];
}

export default { reverse, getCoinsColor, getVolumeColor, getAmountColor };
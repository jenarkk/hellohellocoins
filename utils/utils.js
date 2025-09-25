export function chat(str) {
    ChatLib.chat("&1[&9hellohellocoins&1]&r " + str);
}

export function logError(e) {
    chat("&c" + e);
    console.error(e);
}

export function getBazaarPriceAfterTax(initialPrice) {
    return reductPercentage(initialPrice, 1.25);
}

export function reductPercentage(initialPrice, percentage) {
    return initialPrice * (1 - (percentage / 100));
}
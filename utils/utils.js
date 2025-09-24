export function chat(str) {
    ChatLib.chat("&1[&9hellohellocoins&1]&r " + str);
}

export function logError(e) {
    chat("&c" + e);
    console.error(e);
}

export function getBINTax(price) {
    const CLAIM_TAX = price * 0.01;

    if (price > 0 && price < 10_000_000) return (price * 0.01) + CLAIM_TAX; // 1%
    else if (price >= 10_000_000 && price < 100_000_000) return (price * 0.02) + CLAIM_TAX; // 2%
    else if (price >= 100_000_000) return (price * 0.025) + CLAIM_TAX; // 2.5%
    
    return 0;
}
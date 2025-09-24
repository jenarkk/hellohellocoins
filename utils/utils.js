export function chat(str) {
    ChatLib.chat("&1[&9hellohellocoins&1]&r " + str);
}

export function logError(e) {
    chat("&c" + e);
    console.error(e);
}
import { MCItemStack } from "./mappings";

export const PREFIX = "&1[&9hellohellocoins&1]&r ";

export function chat(str) {
    ChatLib.chat(PREFIX + str);
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

export const getLocation = (id) => id ? "Bazaar" : "Auction House";

export const getSkyblockItemID = (item) => {
    if (item instanceof MCItemStack) item = new Item(item);
    if (!(item instanceof Item)) return null;

    const extraAttributes = item.getNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes");

    const petInfo = extraAttributes.getString("petInfo");
    if (petInfo != null && petInfo.length) {
        const petObject = JSON.parse(petInfo);
        return petObject["type"] + "_PET";
    }

    const itemID = extraAttributes?.getString("id") ?? null;
    if (itemID !== "ENCHANTED_BOOK") return itemID;
    
    // Enchanted books are a pain in the ass
    const enchantments = extraAttributes.getCompoundTag("enchantments");
    const enchants = [...enchantments.getKeySet()];
    if (!enchants.length) return null;

    const enchantment = enchants[0];
    const level = enchantments.getInteger(enchants[0]);

    return `ENCHANTMENT_${enchantment.toUpperCase()}_${level}`;
}

export const getItemUUID = (item) => {
    if (item instanceof MCItemStack) item = new Item(item);
    if (!(item instanceof Item)) return null;

    const extraAttributes = item.getNBT()?.getCompoundTag("tag")?.getCompoundTag("ExtraAttributes");
    return extraAttributes?.getString("uuid") ?? null;
}

function primitiveSimilarity(v1, v2) {
    if (v1 == null && v2 == null) return 1;
    if (v1 == null || v2 == null) return 0;

    return v1.toString() === v2.toString() ? 1 : 0;
}

function arraySimilarity(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b)) return 0;
    if (a.length === 0 && b.length === 0) return 1;

    const setA = new Set(a.map(String));
    const setB = new Set(b.map(String));

    let inter = 0;
    setA.forEach(v => {
        if (setB.has(v)) inter++
    });

    const union = new Set([...setA, ...setB]).size;
    return union === 0 ? 1 : inter / union;
}

function objectSimilarity(o1, o2) {
    o1 = o1 || {};
    o2 = o2 || {};

    const keys = Array.from(new Set([...Object.keys(o1), ...Object.keys(o2)]));
    if (keys.length === 0) return 1;

    let total = 0;
    keys.forEach(k => total += similarityForValues(o1[k], o2[k]));

    return total / keys.length;
}

function similarityForValues(v1, v2) {
    if (Array.isArray(v1) || Array.isArray(v2)) {
        if (Array.isArray(v1) && Array.isArray(v2)) return arraySimilarity(v1, v2);
        return 0;
    }

    const isObj1 = v1 && typeof v1 === 'object';
    const isObj2 = v2 && typeof v2 === 'object';

    if (isObj1 || isObj2) {
        if (isObj1 && isObj2) return objectSimilarity(v1, v2);
        return 0;
    }

    return primitiveSimilarity(v1, v2);
}

export function getSimilarity(fields, a, b) {
    let sum = 0;

    fields.forEach(field => {
        const v1 = a ? a[field] : undefined;
        const v2 = b ? b[field] : undefined;

        const similarity = similarityForValues(v1, v2);
        sum += similarity;
    })

    return sum / fields.length;
}
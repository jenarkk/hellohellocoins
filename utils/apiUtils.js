import { request } from "../../axios";
import { logError } from "./utils";

const COFLNET_URL = "https://sky.coflnet.com/api/";
const NEU_ITEMS_URL = "https://raw.githubusercontent.com/NotEnoughUpdates/NotEnoughUpdates-REPO/refs/heads/master/items/";

const USER_AGENT = "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:142.0) Gecko/20100101 Firefox/142.0";

/**
 * Requests from the skycofl API
 * @param {String} endpoint
 * @returns {Promise}
 */
function requestCofl(endpoint, method = "GET") {
    return request({ 
        url: COFLNET_URL + endpoint,
        method,
        headers: {
            "accept": "text/plain",
            "User-Agent": USER_AGENT
        }
    });
}

/**
 * Requests an estimated item nbt price from the skycofl API
 * @returns {Promise}
 */
function getItemPrice(item) {
    if (!item) return 0;

    const nbt = item.getNBT();
    if (!nbt) return 0;

    return request({
        url: COFLNET_URL + "price/nbt",
        method: "POST",
        headers: {
            "accept": "text/plain",
            "Content-Type": "application/json",
            "User-Agent": USER_AGENT
        },
        body: { jsonNbt: JSON.stringify([nbt]) }
    });
}

/**
 * @param {String} itemId
 * @returns {Promise}
 */
function getInfo(itemId) {
    return request({
        url: NEU_ITEMS_URL + itemId + ".json",
        method: "GET",
        headers: {
            "accept": "text/plain",
            "Content-Type": "application/json-patch+json",
            "User-Agent": "Mozilla/5.0"
        },
    })
}



function getRecipe(itemId) {
    if (!itemId) return Promise.resolve(null);

    const recipes = getRecipes();
    if (recipes[itemId]) return recipes[itemId];

    return getInfo(itemId).then(resp => {
        if (resp.status !== 200) return Promise.resolve(null);

        const data = resp.data;
        if (!data || !data.recipe) return Promise.resolve(null);

        const info = cacheItemInfo(itemId, data);
        return info["recipe"];
    }).catch(e => {
        logError(e);
        return Promise.resolve(null);
    })
}

function getDisplayName(itemId) {
    if (!itemId) return Promise.resolve(null);

    const items = getItems();
    if (items[itemId]) return items[itemId];

    return getInfo(itemId).then(resp => {
        if (resp.status !== 200) return Promise.resolve(null);

        const data = resp.data;
        if (!data || !data.displayname) return Promise.resolve(null);

        const info = cacheItemInfo(itemId, data);
        return info["itemName"];
    }).catch(e => {
        logError(e);
        return Promise.resolve(null);
    })
}

function getItemID(displayName) {
    if (!displayName) return null;
    return getItems().some(e => e.toLowerCase().trim() === displayName.toLowerCase().trim());
}

const ITEMS_PATH = "data/items.json";
const RECIPE_PATH = "data/recipes.json";

function getItems() {
    try {
        if (!FileLib.exists("hellohellocoins", ITEMS_PATH)) return {};
        return JSON.parse(FileLib.read("hellohellocoins", ITEMS_PATH));
    } catch(e) {
        FileLib.delete("hellohellocoins", ITEMS_PATH);
        return {};
    }
}

function getRecipes() {
    try {
        if (!FileLib.exists("hellohellocoins", ITEMS_PATH)) return {};
        return JSON.parse(FileLib.read("hellohellocoins", RECIPE_PATH));
    } catch(e) {
        FileLib.delete("hellohellocoins", RECIPE_PATH);
        return {};
    }
}

function cacheItemInfo(itemId, data) {
    const info = [];

    if (data.displayname) {
        const items = getItems();
        const itemName = ChatLib.removeFormatting(data.displayname);

        items[itemId] = itemName;
        info["itemName"] = itemName;

        FileLib.write("hellohellocoins", ITEMS_PATH, JSON.stringify(items));
    }

    if (data.recipe) {
        const recipes = getRecipes();
        const recipe = ["", "", "", "", "", "", "", "", ""];

        Object.keys(data.recipe).forEach((mat, idx) => recipe[idx] = data.recipe[mat]);
        if (!recipe.some(m => m.length)) return null;

        const recipeObj = {
            // id: amount
        };
    
        for (let i = 0; i < recipe.length; i++) {
            const material = recipe[i];
            if (!material.length) continue;
    
            const info = material.split(":");
    
            const itemId = info[0];
            const amount = parseInt(info[1]);
    
            recipeObj[itemId] = (recipeObj[itemId] ?? 0) + amount;
        }

        recipes[itemId] = recipeObj;
        info["recipe"] = recipeObj;
        
        FileLib.write("hellohellocoins", RECIPE_PATH, JSON.stringify(recipes));
    }

    return info;
}

export default { requestCofl, getItemPrice, getInfo, getRecipe, getItemID, getDisplayName };
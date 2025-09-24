import { request } from "../../axios";

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

export default { requestCofl, getItemPrice, getInfo };
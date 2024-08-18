/*
 * Copyright (C) 2019-2022  Yomichan Authors
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

// this class connects with the Renshuu API 
class RenshuuAPIConnection {
    constructor(dictionary = null) {
        this._enabled = false;
        this._apiKey = null;
        this._dictionary = dictionary || new RenshuuDictionary();
    }

    /**
     * Gets the enabled state
     * @type {boolean}
     */
    get enabled() {
        return this._enabled;
    }

    /**
     * Sets the enabled state of the API connection
     * @param {boolean} value
     */
    set enabled(value) {
        this._enabled = value;
    }

    /** 
     * Sets the API key
     * @param {string} key
     */
    set apiKey(key) {
        this._apiKey = key;
    }

    /**
     * Gets the API key
     * @type {string}
     */
    get apiKey() {
        return this._apiKey;
    }

    /**
     * Checks if the connection to the API is established 
     * @returns {Promise<boolean>} 
     */
    async isConnected() {
        try {
            await this._apiCall("profile", "GET");
            return true;
        }
        catch (e) {
            return false;
        }
    }

    // gets the user profile
    async getProfile() {
        if (!this._enabled) { return null; }
        return await this._apiCall("profile", "GET");
    }

    // gets a kanji by search 
    async getKanji(kanji) {
        if (!this._enabled) { return null; }
        return await this._apiCall("kanji/search?value=" + kanji, "GET");
    }

    // remove a kanji from a schedule 
    async deleteKanji(kanji, schedule) {
        if (!this._enabled) { return null; }
        return await this._apiCall(`kanji/${kanji}?sched_id=${schedule}`, "DELETE");
    }

    // add a kanji to a schedule
    async addKanji(kanji, schedule) {
        if (!this._enabled) { return null; }
        return await this._apiCall(`kanji/${kanji}?sched_id=${schedule}`, "PUT");
    }

    // searches a word on renshuu
    // need to use this first before using delete and 
    
    // remove a word from a schedule 
    async deleteWord(word, schedule) {
        if (!this._enabled) { return null; }
        return await this._apiCall(`word/`)
    }

    /**
     * Communicates with the API server
     * @param {string} action the action that you want to do, not preceeded by the renshuu website link
     * @param {string} method
     */
    async _apiCall(action, method) {
        if (this._apiKey === null) { return; }
        let response;
        try {
            response = await fetch("https://api.renshuu.org/v1/" + action, {
                method: method,
                cache: "default",
                headers: {
                    "Accept": "application/json",
                    "Authorization": "Bearer " + this._apiKey
                }
            });
        }
        catch (e) {
            const error = new Error("Renshuu connection failure");
            error.data = {action, method, originalError: e};
            throw error; 
        }

        if (!response.ok) {
            const error = new Error(`Renshuu connection error: ${response.status}`);
            error.data = {action, method, status: response.status};
            throw error;
        }

    }


}
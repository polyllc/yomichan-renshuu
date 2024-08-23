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


class DisplayRenshuu {
    constructor(display) {
        this._display = display;
        this._renshuuController = new RenshuuController(null);
        this._eventListeners = new EventListenerCollection();
        this._notification = null;
    }

    prepare() {
        this._display.on("optionsUpdated", this._renshuuController.syncWithSettings.bind(this._renshuuController));
        this._display.on('contentUpdateEntry', this._onContentUpdateEntry.bind(this));
    }


    async onClick(e) {
        const button = e.currentTarget;
        const dictionaryEntryIndex = this._display.getElementDictionaryEntryIndex(button);
        if(this._notification === null) {
            this._notification = this._display.createNotification(true);
        }

        let text = "";
        if(!this._renshuuController._renshuuAPIConnection.enabled) {
            text = "Renshuu not enabled";
        }
        else {
            text = this._getHeadword(dictionaryEntryIndex, 0);
            try {
            let res = await this._renshuuController._renshuuAPIConnection.searchWord(text);
            let wordResult = await res.text().then( async (txt) => {
                let json = JSON.parse(txt);
                if (json.result_count < 1) {
                    text = `No results found (${JSON.parse(txt).api_usage.calls_today}/${JSON.parse(txt).api_usage.daily_allowance} API calls used today)`;
                }
                else {
                    try {
                        let res = await this._renshuuController._renshuuAPIConnection.addWord(json.words[0].id, this._renshuuController._renshuuTermID);
                        let apiCallsLeft = await res.text().then(async (t) => { 
                            return `(${JSON.parse(t).api_usage.calls_today}/${JSON.parse(t).api_usage.daily_allowance} API calls used today)`;
                        });
                        text = "Added " + text + " " + apiCallsLeft;
                    }
                    catch(e) {
                        text = e.message;
                        if(e.message.includes("409")) {
                            text = "Word already added";
                        }
                        if(e.message.includes("404")) {
                            text = "Schedule not selected";
                        }
                    }
                }
            });
            }
            catch (e) {
                text = e.message;
                if(e.message.includes("401")) {
                    text = "API Connection error. (Maybe check your API key?)";
                }
                if(e.message.includes("409")) {
                    text = "Word not found";
                }
            }
            
            
        }

        this._notification.setContent(text);
        this._notification.open();
    }

    syncWithSettings({options}) {
        this._settingsOptions = {options};
        this._renshuuController._renshuuAPIConnection._enabled = options.renshuu.enabled;
        this._renshuuController._renshuuAPIConnection._apiKey = options.renshuu.apiKey;
        this._renshuuController._renshuuTermID = options.renshuu.scheduleTerm;
        this._renshuuController._renshuuKanjiID = options.renshuu.scheduleKanji;
    }

    _onContentUpdateEntry({element}) {
        const eventListeners = this._eventListeners;
        for (const button of element.querySelectorAll('.action-button[data-action=add-term]')) {
            eventListeners.addEventListener(button, 'click', this.onClick.bind(this), false);
        }
    }

    _getHeadword(dictionaryEntryIndex, headwordIndex) {
        const {dictionaryEntries} = this._display;
        if (dictionaryEntryIndex < 0 || dictionaryEntryIndex >= dictionaryEntries.length) { return null; }

        const dictionaryEntry = dictionaryEntries[dictionaryEntryIndex];
        if (dictionaryEntry.type === 'kanji') { return null; }

        const {headwords} = dictionaryEntry;
        if (headwordIndex < 0 || headwordIndex >= headwords.length) { return null; }

        return headwords[headwordIndex].term;
    }
}
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

class RenshuuController {
    constructor(settingsController) {
        this._settingsController = settingsController;
        this._renshuuAPIConnection = new RenshuuAPIConnection();
        this._renshuuDictionary = new RenshuuDictionary();
        this._renshuuErrorMessage = null;
        this._renshuuScheduleTermList = null;
        this._renshuuScheduleKanjiList = null;

        this._renshuuKanjiID = 0;
        this._renshuuTermID = 0;
    }

    get settingsController() {
        return this._settingsController;
    }

    async prepare() {
        this._renshuuEnableCheckbox = document.querySelector(`[data-setting="renshuu.enable"]`);
        this._renshuuErrorMessage = document.querySelector(`#renshuu-error-message`);
        this._renshuuScheduleTermList = document.querySelector("#renshuu-schedule-term-setting");
        this._renshuuScheduleKanjiList = document.querySelector("#renshuu-schedule-kanji-setting");
        let renshuuAPIInput = document.querySelector(`[data-setting="renshuu.key"]`);

        if (this._renshuuEnableCheckbox !== null) { this._renshuuEnableCheckbox.addEventListener("settingChanged", this._onRenshuuEnableChanged.bind(this), false); }
        if (renshuuAPIInput !== null) { renshuuAPIInput.addEventListener("settingChanged", this._onRenshuuAPIKeyChanged.bind(this), false); }
        this._renshuuScheduleTermList.addEventListener("change", this._onTermScheduleChanged.bind(this), false);
        this._renshuuScheduleKanjiList.addEventListener("change", this._onKanjiScheduleChanged.bind(this), false);

        const onRenshuuSettingChanged = () => { this._updateOptions(); };
        const nodes = [renshuuAPIInput, ...document.querySelectorAll('[data-setting="renshuu.enable"]'), this._renshuuScheduleKanjiList, this._renshuuScheduleTermList];
        for (const node of nodes) {
            node.addEventListener('settingChanged', onRenshuuSettingChanged);
        }

        this._settingsController.on('optionsChanged', this._onOptionsChanged.bind(this));
    }

    async syncWithSettings({options}) {
        this._renshuuAPIConnection.enabled = options.renshuu.enabled;
        this._renshuuAPIConnection.apiKey = options.renshuu.apiKey;
        this._renshuuTermID = options.renshuu.scheduleTerm;
        this._renshuuKanjiID = options.renshuu.scheduleKanji;
        console.log("got them" + options);
    }

    async _onRenshuuEnableChanged({detail: {value}}) {
        if (this._renshuuAPIConnection.apiKey === null || this._renshuuAPIConnection.apiKey == "") { console.log("none: " + this._renshuuAPIConnection.apiKey); return; } // notify user to set api key
        this._renshuuAPIConnection.enabled = value;
        console.log("toggle enable: " + value);
        if (value) {
            this._renshuuErrorMessage.textContent = await this._testAPIConnection.bind(this)();
            try {
                await this._renshuuUpdateSchedules();
            }
            catch(e) {

            }
        }
        else {
            this._renshuuErrorMessage.textContent = "Not enabled";
            this._clearScheduleList();
        }
        console.log("toggle enable: " + value);
    }

    async _onTermScheduleChanged() {
        if (!this._renshuuAPIConnection.enabled) { return; }
        const {value} = this._renshuuScheduleTermList;
        this._renshuuTermID = value;
        await this._settingsController.setProfileSetting('renshuu.scheduleTerm', this._renshuuTermID);
        console.log(value);

    }

    async _onKanjiScheduleChanged() {
        if (!this._renshuuAPIConnection.enabled) { return; }
        const {value} = this._renshuuScheduleKanjiList;
        this._renshuuKanjiID = value;
        await this._settingsController.setProfileSetting('renshuu.scheduleKanji', this._renshuuKanjiID);
        console.log(value);
        
    }

    _clearScheduleList() {
        let children = this._renshuuScheduleTermList.children;
        for (let i = 0; i < children.length; i++) {
            children[0].remove();
        }

        children = this._renshuuScheduleKanjiList.children;
        for (let i = 0; i < children.length; i++) {
            children[0].remove();
        }
    }

    async _renshuuUpdateSchedules() {
        let schedules = await this._renshuuAPIConnection.getSchedules();
        for (const schedule of schedules) {
            let node = document.createElement("option");
            node.value = schedule.id;
            node.textContent = schedule.name;
            this._renshuuScheduleTermList.appendChild(node);
        }
        for (const schedule of schedules) {
            let node = document.createElement("option");
            node.value = schedule.id;
            node.textContent = schedule.name;
            this._renshuuScheduleKanjiList.appendChild(node);
        }
    }

    _onRenshuuAPIKeyChanged({detail: {value}}) {
        this._renshuuAPIConnection.apiKey = value;
        console.log("added api key: " + value);
    }

    async _testAPIConnection() {
        if (this._renshuuAPIConnection.enabled && this._renshuuAPIConnection.apiKey !== undefined && this._renshuuAPIConnection.apiKey != "") {
            try {
                let res = await this._renshuuAPIConnection.getProfile();
                let text = await res.text().then((text) => {
                    let json = JSON.parse(text);
                    return json.real_name;
                });
                return "Logged in as " + text;
            }
            catch(e) {
                return e;
            }
        }
        return "Not enabled";
    }

    async _updateOptions() {
        const options = await this._settingsController.getOptions();
        this._onOptionsChanged({options});
    }

    async _onOptionsChanged({options}) {

        this._renshuuScheduleTermList.value = options.renshuu.scheduleTerm;
        this._renshuuScheduleKanjiList.value = options.renshuu.scheduleKanji;

        await this._settingsController.setProfileSetting('renshuu.enabled', this._renshuuAPIConnection.enabled);
        await this._settingsController.setProfileSetting('renshuu.apiKey', this._renshuuAPIConnection.apiKey);
        await this._settingsController.setProfileSetting('renshuu.scheduleTerm', this._renshuuTermID);
        await this._settingsController.setProfileSetting('renshuu.scheduleKanji', this._renshuuKanjiID);
    }

}
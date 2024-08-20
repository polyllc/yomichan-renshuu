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
    }

    get settingsController() {
        return this._settingsController;
    }

    async prepare() {
        this._renshuuEnableCheckbox = document.querySelector(`[data-setting="renshuu.enable"]`);
        let renshuuAPIInput = document.querySelector(`[data-setting="renshuu.key"]`);

        if (this._renshuuEnableCheckbox !== null) { this._renshuuEnableCheckbox.addEventListener("settingChanged", this._onRenshuuEnableChanged.bind(this), false); }

        const onRenshuuSettingChanged = () => { this._updateOptions(); };
        const nodes = [renshuuAPIInput, ...document.querySelectorAll('[data-setting="renshuu.enable"]')];
        for (const node of nodes) {
            node.addEventListener('settingChanged', onRenshuuSettingChanged);
        }

        this._settingsController.on('optionsChanged', this._onOptionsChanged.bind(this));
    }

    _onRenshuuEnableChanged({detail: {value}}) {
        //if (this._renshuuAPIConnection._apiKey === null) { return; } // notify user to set api key
        this._renshuuAPIConnection.enabled = value;
        console.log("toggle enable");
    }

    async _updateOptions() {
        const options = await this._settingsController.getOptions();
        this._onOptionsChanged({options});
    }

    _onOptionsChanged({options: {renshuu}}) {
        let {apiKey} = renshuu;
        if (apiKey === '') { apiKey = null; }
        this._renshuuAPIConnection.apiKey = renshuu.apiKey;
        this._renshuuAPIConnection.enabled = renshuu.enabled;
    }

}
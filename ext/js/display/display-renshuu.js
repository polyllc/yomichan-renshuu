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
    //  console.log(this._display);
            this._notification = this._display.createNotification(true);
        }

        let text = "";
        console.log(this._settingsOptions);
        if(!this._renshuuController._renshuuAPIConnection.enabled) {
            text = "Renshuu not enabled";
        }
        else {
            console.log(this._renshuuController);
            text = this._getHeadword(dictionaryEntryIndex, 0);
            try {
            let res = await this._renshuuController._renshuuAPIConnection.searchWord(text);
            let wordResult = await res.text().then( async (txt) => {
                let json = JSON.parse(txt);
                if (json.result_count < 1) {
                    text = "No results found";
                }
                else {
                    try {
                        await this._renshuuController._renshuuAPIConnection.addWord(json.words[0].id, this._renshuuController._renshuuTermID);
                        text = "Added " + text;
                    }
                    catch(e) {
                        text = e.message;
                        if(e.message.includes("409")) {
                            text = "Word already added";
                        }
                    }
                }
            });
            }
            catch (e) {
             //   console.log(e);
                text = e.message;
                if(e.message.includes("401")) {
                    text = "API Connection error. (Maybe check your API key?)";
                }
                if(e.message.includes("409")) {
                    text = "Word not found";
                }
                if(e.message.includes("404")) {
                    text = "Schedule not selected";
                }
            }
            
        }

        this._notification.setContent(text);
        this._notification.open();
    }

    syncWithSettings({options}) {
    //    console.log(options);
        this._settingsOptions = {options};
        this._renshuuController._renshuuAPIConnection._enabled = options.renshuu.enabled;
        this._renshuuController._renshuuAPIConnection._apiKey = options.renshuu.apiKey;
        this._renshuuController._renshuuTermID = options.renshuu.scheduleTerm;
        this._renshuuController._renshuuKanjiID = options.renshuu.scheduleKanji;
    }

    _onContentUpdateEntry({element}) {
        const eventListeners = this._eventListeners;
      //  console.log(this._display);
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
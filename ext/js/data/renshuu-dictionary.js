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

// this class holds all of the information of cached vocab and kanji searches in order to reduce API calls

class RenshuuDictionary {
    constructor() {
        this._vocabDictionary = new Map();
        this._kanjiDictionary = new Map();
    }

    importWords(wordsArray) {
        foreach(word in wordsArray) {
            this._kanjiDictionary.set(word.kanji_full, word.id); 
            this._kanjiDictionary.set(word.hiragana, word.id); 
        }
    } 
}
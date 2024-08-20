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
        this._kanaToVocabDictionary = new Map();
    }

    importWords(wordsArray) {
        for (word of wordsArray) {
            
            setWord(word);
        }
    } 

    getWord(word) {
        return this._vocabDictionary.get(this._kanaToVocabDictionary.get(word));
    }

    setWord(word) { 
        // we can do this because renshuu still associates kanji words with their hiragana counterpart
        // since kanji is far more unique than hiragana or katakana representations, we prefer kanji readings
        // we fall back to the hiragana or katakana reading (although most of the time, katakana won't have kanji)
        // we do this awkward setting to both maps in order to simplify our getWord method
        if(word.kanji_full != "") {
            this._vocabDictionary.set(word.kanji_full, word.id); 
            this._kanaToVocabDictionary.set(word.kanji_full, word.kanji_full);
            this._kanaToVocabDictionary.set(word.hiragana_full, word.kanji_full);
        }
        else {
            this._vocabDictionary.set(word.hiragana_full, word.id); 
            this._kanaToVocabDictionary.set(word.hiragana_full, word.hiragana_full);
        }
    }
}
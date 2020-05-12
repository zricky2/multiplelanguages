let speakBtn, txtFld, speakerMenu, allVoices, langtags, allLanguages, primaryLanguages, langhash, langcodehash, rateFld, languageMenu;
let voiceIndex = 0;
let initialSetup = true;
let defaultBlurb = "I love to learn";

function init() {
    speakBtn = qs("#speakBtn");
    txtFld = qs("#txtFld");
    speakerMenu = qs("#speakerMenu");
    rateFld = qs("#rateFld");
    languageMenu = qs("#languageMenu");
    langtags = getLanguageTags(); //language object(code, name)
    langhash = getLookupTable(langtags, "name");
    langcodehash = getLookupTable(langtags, "code");
    
    blurbs = {
        "Arabic": "أنا أستمتع بالموسيقى التقليدية لبلدي الأم.",
        "Chinese": "我喜歡我祖國的傳統音樂。",
        "Czech": "Mám rád tradiční hudbu mé rodné země.",
        "Danish": "Jeg nyder den traditionelle musik i mit hjemland.",
        "Dutch": "Ik geniet van de traditionele muziek van mijn geboorteland.",
        "English": "I enjoy the traditional music of my native country.",
        "Finnish": "Nautin kotimaassani perinteistä musiikkia.",
        "French": "J'apprécie la musique traditionnelle de mon pays d'origine.",
        "German": "Ich genieße die traditionelle Musik meiner Heimat.",
        "Greek": "Απολαμβάνω την παραδοσιακή μουσική της πατρίδας μου.",
        "Hebrew": "אני נהנה מהמוסיקה המסורתית של מולדתי.",
        "Hindi": "मैं अपने मूल देश के पारंपरिक संगीत का आनंद लेता हूं।",
        "Hungarian": "Élvezem az én hazám hagyományos zenéjét.",
        "Indonesian": "Saya menikmati musik tradisional negara asal saya.",
        "Italian": "Mi piace la musica tradizionale del mio paese natale.",
        "Japanese": "私は母国の伝統音楽を楽しんでいます。",
        "Korean": "나는 내 조국의 전통 음악을 즐긴다.",
        "Norwegian Bokmal": "Jeg liker den tradisjonelle musikken i mitt hjemland.",
        "Polish": "Lubię tradycyjną muzykę mojego kraju.",
        "Portuguese": "Eu gosto da música tradicional do meu país natal.",
        "Romanian": "Îmi place muzica tradițională din țara mea natală.",
        "Russian": "Мне нравится традиционная музыка моей родной страны.",
        "Slovak": "Mám rád tradičnú hudbu svojej rodnej krajiny.",
        "Spanish": "Disfruto de la música tradicional de mi país natal.",
        "Swedish": "Jag njuter av traditionell musik i mitt hemland.",
        "Thai": "ฉันเพลิดเพลินกับดนตรีดั้งเดิมของประเทศบ้านเกิดของฉัน",
        "Turkish": "Ülkemdeki geleneksel müzikten zevk alıyorum."
    };

    
    languageMenu.addEventListener("change", () => {
        filterVoices();
        speakerMenu.selectedIndex = 0;
    });

    speakBtn.addEventListener("click", () => {
        let sval = Number(speakerMenu.value); //Number() can be used to convert JavaScript variables to numbers:
        let u = new SpeechSynthesisUtterance(); // interface of the Web Speech API represents a speech request. It contains the content the speech service should read and information about how to read it (e.g. language, pitch and volume.)
        u.voice = allVoices[sval];
        u.lang = u.voice.lang;
        u.text = txtFld.value;
        u.rate = Number(rateFld.value);
        speechSynthesis.speak(u);
    }); //The default value is false, which will use the bubbling propagation, when the value is set to true, the event uses the capturing propagation.

    if (window.speechSynthesis) {//checks for speechSynthesis 
        if (speechSynthesis.onvoiceschanged !== undefined) {
            // Chrome gets the voices asynchronously so this is needed
            speechSynthesis.onvoiceschanged = setUpVoices;
        }
        setUpVoices(); // For all the other browsers
    } else {
        speakBtn.disabled = true;
        speakerMenu.disabled = true;
        qs("#warning").style.display = "block";
        languageMenu.disabled = true;
    }
}

//lang attribute (e.g. “en,” “es,” “ru,” “de,” “fr”)
//return object(code,name)
function getLanguageTags() {
    let langs = ["ar-Arabic", "cs-Czech", "da-Danish", "de-German", "el-Greek", "en-English", "eo-Esperanto", "es-Spanish", "et-Estonian", "fi-Finnish", "fr-French", "he-Hebrew", "hi-Hindi", "hu-Hungarian", "id-Indonesian", "it-Italian", "ja-Japanese", "ko-Korean", "la-Latin", "lt-Lithuanian", "lv-Latvian", "nb-Norwegian Bokmal", "nl-Dutch", "nn-Norwegian Nynorsk", "no-Norwegian", "pl-Polish", "pt-Portuguese", "ro-Romanian", "ru-Russian", "sk-Slovak", "sl-Slovenian", "sq-Albanian", "sr-Serbian", "sv-Swedish", "th-Thai", "tr-Turkish", "zh-Chinese"];
    let langobjects = [];
    for (let i = 0; i < langs.length; i++) {
        let langparts = langs[i].split("-"); // splits the string into two parts
        langobjects.push({ "code": langparts[0], "name": langparts[1] });
    }
    return langobjects;
}

//“Question mark” or “conditional” operator in JavaScript is a ternary operator that has three operands.
// Generic Utility Functions
function searchObjects(array, prop, term, casesensitive = false) {
    // Searches an array of objects for a given term in a given property
    // Returns an array of only those objects that test positive
    let regex = new RegExp(term, casesensitive ? "" : "i");
    let newArrayOfObjects = array.filter(obj => regex.test(obj[prop]));
    return newArrayOfObjects;
}

function setUpVoices() {
    allVoices = getAllVoices();
    allLanguages = getAllLanguages(allVoices);
    primaryLanguages = getPrimaryLanguages(allLanguages);
    filterVoices();
    if (initialSetup && allVoices.length) {
        initialSetup = false;
        createLanguageMenu();
    }
}

function getAllVoices() {
    let voicesall = speechSynthesis.getVoices(); //Returns a list of SpeechSynthesisVoice objects representing all the available voices on the current device.
    let vuris = [];
    let voices = [];
    voicesall.forEach((obj, index) => {
        let uri = obj.voiceURI;
        if (!vuris.includes(uri)) {
            vuris.push(uri);
            voices.push(obj);
        }
    });

    voices.forEach((obj, index) => { obj.id = index; });
    return voices;
}

function getAllLanguages(voices) {
    let langs = [];
    voices.forEach(vobj => {
        langs.push(vobj.lang.trim());
    });
    return [...new Set(langs)];
}

function getPrimaryLanguages(langlist) {
    let langs = [];
    langlist.forEach(vobj => {
        langs.push(vobj.substring(0, 2));
    });
    return [...new Set(langs)];
}



function createSpeakerMenu(voices) {
    let code;

    voices.forEach(function (vobj, i) {
        code += `<option value=${vobj.id}>`;
        code += `${vobj.name} (${vobj.lang})`;
        code += (vobj.voiceURI.includes(".premium")) ?
            ' premium' : '';
        code += `</option>`;
    });

    speakerMenu.innerHTML = code;
    speakerMenu.selectedIndex = voiceIndex;
}

function filterVoices() {
    let langcode = languageMenu.value;
    voices = allVoices.filter(function (voice) {
        return langcode === "all" ? true : voice.lang.indexOf(langcode + "-") >= 0;
    });
    createSpeakerMenu(voices);
    let t = blurbs[languageMenu.options[languageMenu.selectedIndex].text];
    txtFld.value = t ? t : defaultBlurb;
    speakerMenu.selectedIndex = voiceIndex;
}

function createLanguageMenu() {
    let code = `<option selected value="all">Show All</option>`;
    let langnames = [];
    primaryLanguages.forEach(function (lobj, i) {
        langnames.push(langcodehash[lobj.substring(0, 2)].name);
    });
    langnames.sort();
    langnames.forEach(function (lname, i) {
        let lcode = langhash[lname].code;
        code += `<option value=${lcode}>${lname}</option>`;
    });
    languageMenu.innerHTML = code;
}

function getLookupTable(objectsArray, propname) {
    return objectsArray.reduce((accumulator, currentValue) => (accumulator[currentValue[propname]] = currentValue, accumulator), {});
}


// Reusable utility functions
function qs(selectorText) {
    // Saves lots of typing for those who eschew jQuery
    return document.querySelector(selectorText);
}
//after the DOM loads init() will be called
document.addEventListener('DOMContentLoaded', function (e) {
    try { init(); } catch (error) {
        console.log("Data didn't load", error);
    }
});

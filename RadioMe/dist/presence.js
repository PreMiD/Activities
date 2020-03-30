//-----------------------------------------------------------------------------------------------------------------------------------------------------
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};

var presence = new Presence({
    clientId: '660519861742731264',
    
}), strings = presence.getStrings({
    play: 'presence.playback.playing',
    pause: 'presence.playback.paused',
    browse: 'presence.activity.browsing',
    search: 'presence.activity.searching'
});
//-----------------------------------------------------------------------------------------------------------------------------------------------------
var language = navigator.language || navigator.userLanguage;//Browser language
var lastRadio = '';
var browsingStamp = 0;//Timestamp when started listening to a radio station

switch(language) {
    //German
    //---------------------------------------
    case 'de':
    case 'de-CH':
    case 'de-AT':
    case 'de-LU':
    case 'de-LI':
        language = 'de';
        break;
    //French
    //---------------------------------------
    case 'fr':
    case 'fr-BE':
    case 'fr-CA':
    case 'fr-CH':
    case 'fr-LU':
        language = 'fr';
        break;
    //English / Unknown
    //---------------------------------------
    case 'en':
    case 'en-US':
    case 'en-EG':
    case 'en-AU':
    case 'en-GB':
    case 'en-CA':
    case 'en-NZ':
    case 'en-IE':
    case 'en-ZA':
    case 'en-JM':
    case 'en-BZ':
    case 'en-TT':
    default:
        language = 'en';
        break;
}
//-----------------------------------------------------------------------------------------------------------------------------------------------------
presence.on('UpdateData', () => __awaiter(this, void 0, void 0, function* () {
    const host = window.location.hostname.replace('www.', '');
    const path = window.location.pathname.split('/').slice(1);
    var presenceData = {
        details: 'RadioMe',
        largeImageKey: 'logo_big'
    };

    switch(path[0]) {
        //Radio / Region
        //------------------------------------------------------------------------------
        default:
            if(path[0]) {
                if(document.getElementById('station-website')) {
                    //Radio
                    //---------------------------------------
                    if(document.getElementsByClassName('song-name')[0].innerText.length > 0) {
                        if(document.getElementsByClassName('playbutton-global playbutton-global-playing').length > 0) {
                            //Radio is playing
                            //---------------------------------------
                            if(!browsingStamp || lastRadio != document.getElementsByClassName('song-name')[0].innerText) browsingStamp = Math.floor(Date.now() / 1000);
                            presenceData.startTimestamp = browsingStamp;
                            lastRadio = document.getElementsByClassName('song-name')[0].innerText;
            
                            presenceData.smallImageKey = 'play';
                            presenceData.smallImageText = (yield strings).play;
            
                            presenceData.details = document.getElementsByClassName('song-name')[0].innerText;
                        } else {
                            //Radio is stopped
                            //---------------------------------------
                            browsingStamp = 0;
            
                            presenceData.smallImageKey = 'pause';
                            presenceData.smallImageText = (yield strings).pause;
            
                            presenceData.details = document.getElementsByClassName('song-name')[0].innerText;
                        }
                    } else {
                        browsingStamp = 0;

                        presenceData.details = document.querySelector('h1').innerText;
                        switch(language) {
                            case 'de':
                                presenceData.state = `${document.getElementById('bar-ratingValue').innerText} von 5 Sternen (${document.getElementById('bar-ratingCount').innerText} Bewertungen)`;
                                break;
                            case 'fr':
                                presenceData.state = `${document.getElementById('bar-ratingValue').innerText} sur 5 étoiles (${document.getElementById('bar-ratingCount').innerText} notes)`;
                                break;
                            case 'en':
                                presenceData.state = `${document.getElementById('bar-ratingValue').innerText} of 5 stars (${document.getElementById('bar-ratingCount').innerText} Ratings)`;
                                break;
                        }
                    }
                } else {
                    //Region
                    //---------------------------------------
                    presenceData.smallImageKey = 'reading';
                    presenceData.smallImageText = (yield strings).browse;
                    switch(language) {
                        case 'de':
                            presenceData.details = document.querySelector('h1').innerText;
                            presenceData.state = `auf ${host}`;
                            break;
                        case 'fr':
                            presenceData.details = document.querySelector('h1').innerText;
                            presenceData.state = `sur ${host}`;
                            break;
                        case 'en':
                            presenceData.details = document.querySelector('h1').innerText;
                            presenceData.state = `on ${host}`;
                            break;
                    }
                }
            } else {
                //Home
                //---------------------------------------
                if(document.getElementsByClassName('song-name')[0].innerText.length > 0) {
                    if(document.getElementsByClassName('playbutton-global playbutton-global-playing').length > 0) {
                        //Radio is playing
                        //---------------------------------------
                        if(!browsingStamp || lastRadio != document.getElementsByClassName('song-name')[0].innerText) browsingStamp = Math.floor(Date.now() / 1000);
                        presenceData.startTimestamp = browsingStamp;
                        lastRadio = document.getElementsByClassName('song-name')[0].innerText;
        
                        presenceData.smallImageKey = 'play';
                        presenceData.smallImageText = (yield strings).play;
        
                        presenceData.details = document.getElementsByClassName('song-name')[0].innerText;
                    } else {
                        //Radio is stopped
                        //---------------------------------------
                        browsingStamp = 0;
        
                        presenceData.smallImageKey = 'pause';
                        presenceData.smallImageText = (yield strings).pause;
        
                        presenceData.details = document.getElementsByClassName('song-name')[0].innerText;
                    }
                } else {
                    presence.setTrayTitle();
                    presence.setActivity();
                    return;
                }
            }
            break;
        //Search
        //------------------------------------------------------------------------------
        case 'search':
            browsingStamp = 0;
            presenceData.smallImageKey = 'search';
            presenceData.smallImageText = (yield strings).search;
            switch(language) {
                case 'de':
                    presenceData.details = `Sucht nach "${new URLSearchParams(window.location.search).get('term')}"`;
                    presenceData.state = `auf ${host}`;
                    break;
                case 'fr':
                    presenceData.details = `Recherche "${new URLSearchParams(window.location.search).get('term')}"`;
                    presenceData.state = `sur ${host}`;
                    break;
                case 'en':
                    presenceData.details = `Searching for "${new URLSearchParams(window.location.search).get('term')}"`;
                    presenceData.state = `on ${host}`;
                    break;
            }
            break;
        //------------------------------------------------------------------------------
    }

    presence.setActivity(presenceData);
}));
//-----------------------------------------------------------------------------------------------------------------------------------------------------
presence.on('MediaKeys', key => {
    switch(key) {
        //Play / Pause / Stop
        //------------------------------------------------------------------------------
        case 'pause':
        if(document.getElementsByClassName('playbutton-global playbutton-global-playing').length > 0) {
            document.getElementsByClassName('playbutton-global playbutton-global-playing')[0].click();
        } else if(document.getElementsByClassName('playbutton-global playbutton-global-paused').length > 0) {
            document.getElementsByClassName('playbutton-global playbutton-global-paused')[0].click();
        }
        //Skip
        //------------------------------------------------------------------------------
        case 'nextTrack':
            break;
        //Rewind
        //------------------------------------------------------------------------------
        case 'previousTrack':
            break;
        //------------------------------------------------------------------------------
    }
});
//-----------------------------------------------------------------------------------------------------------------------------------------------------
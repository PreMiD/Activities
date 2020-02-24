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
    clientId: '665519810054062100',
    mediaKeys: false
}), strings = presence.getStrings({
    search: 'presence.activity.searching',
    browsing: 'presence.activity.browsing',
    reading: 'presence.activity.reading'
});
//-----------------------------------------------------------------------------------------------------------------------------------------------------
presence.on('UpdateData', () => __awaiter(this, void 0, void 0, function* () {
    const host = window.location.hostname.replace('www.', '');
    const path = window.location.pathname.split('/').slice(1);
    var presenceData = {
        details: 'IFTTT',
        largeImageKey: 'logo_big'
    };
	
    switch(host) {
        //IFTTT URL Shortener (for the Help Center)
        //---------------------------------------------------------------------------------------------------------------------
        case 'ift.tt':
            presence.setTrayTitle();
            presence.setActivity();
            return;
        //IFTTT for Business
        //---------------------------------------------------------------------------------------------------------------------
        case 'platform.ifttt.com':
            presenceData.details = 'for Business';
            if(path.length > 0) {
                switch(path[0]) {
                    //Plans
                    //------------------------------------------------------------------------------
                    case 'plans':
                        presenceData.state = 'Plans';
                        break;
                    //Documentation
                    //------------------------------------------------------------------------------
                    case 'docs':
                        presenceData.state = 'Documentation';

                        if(document.querySelector('h1')) {
							presenceData.smallImageKey = 'reading';
                            presenceData.smallImageText = (yield strings).reading;
                            
                            presenceData.details = 'Documentation';
                            presenceData.state = document.querySelector('h1').innerText;
                        } else {
							presenceData.smallImageKey = 'reading';
                            presenceData.smallImageText = (yield strings).browsing;
                        }
                        break;
                    //Library
                    //------------------------------------------------------------------------------
                    case 'blog':
                        presenceData.state = 'Library';

                        if(document.getElementsByClassName('story-title').length > 0) {
							presenceData.smallImageKey = 'reading';
                            presenceData.smallImageText = (yield strings).reading;

                            presenceData.details = 'Library';
                            presenceData.state = document.getElementsByClassName('story-title')[0].innerText;
                        }
                        break;
                    //Case studies
                    //------------------------------------------------------------------------------
                    case 'case_studies':
                        presenceData.state = 'Case studies';

                        if(document.getElementsByClassName('story-title').length > 0) {
							presenceData.smallImageKey = 'reading';
                            presenceData.smallImageText = (yield strings).reading;

                            presenceData.details = 'Case studies';
                            presenceData.state = document.getElementsByClassName('story-title')[0].innerText;
                        }
                        break;
                    //Testimonials
                    //------------------------------------------------------------------------------
                    case 'testimonials':
                        presenceData.state = 'Testimonials';
                        break;
                    //------------------------------------------------------------------------------
                    //Contact
                    case 'contact_sales':
                        presenceData.state = 'Contact';
                        break;
                    //Terms of Use
                    //------------------------------------------------------------------------------
                    case 'terms':
                        presenceData.state = 'Terms of Use';
                        break;
                    //------------------------------------------------------------------------------
                }
            }
            break;
        //IFTTT Help Center
        //---------------------------------------------------------------------------------------------------------------------
        case 'help.ifttt.com':
            presenceData.details = 'Help Center';
            if(path.length > 2) {
                switch(path[2]) {
                    //Articles
                    //------------------------------------------------------------------------------
                    case 'articles':
                        presenceData.smallImageKey = 'reading';
                        presenceData.smallImageText = (yield strings).reading;

                        presenceData.state = document.querySelector('h1').innerText;
                        break;
                    //Categories
                    //------------------------------------------------------------------------------
                    case 'categories':
                    case 'sections':
                        presenceData.smallImageKey = 'reading';
                        presenceData.smallImageText = (yield strings).browsing;

                        presenceData.state = document.querySelector('h1').innerText;
                        break;
                    //Search
                    //------------------------------------------------------------------------------
                    case 'search':
                        presenceData.smallImageKey = 'search';
                        presenceData.smallImageText = (yield strings).search;

                        presenceData.state = `Searching for "${new URLSearchParams(window.location.search).get('query')}"`;
                        break;
                    //------------------------------------------------------------------------------
                }
            }
            break;
        //IFTTT
        //---------------------------------------------------------------------------------------------------------------------
        default:
        case 'ifttt.com':
            switch(path[0]) {
                //Applets
                //------------------------------------------------------------------------------
                case 'applets':
                    presenceData.smallImageKey = 'reading';
                    presenceData.smallImageText = (yield strings).browsing;

                    presenceData.details = document.getElementsByClassName('connection-title')[0].innerText;
                    presenceData.state = document.getElementsByClassName('owner by-and-author-link')[0].innerText.replace('\n', ' ');
                    break;
                //Sign up
                //------------------------------------------------------------------------------
                case 'join':
                    presenceData.smallImageKey = 'writing';

                    presenceData.details = 'Sign up';
                    break;
                //Sign in
                //------------------------------------------------------------------------------
                case 'login':
                    presenceData.smallImageKey = 'writing';
                    
                    presenceData.details = 'Sign in';
                    break;
                //Session
                //------------------------------------------------------------------------------
                case 'session':
                    if(path.length > 1) {
                        switch(path[1]) {
                            case 'logout':
                                presenceData.smallImageKey = 'writing';
                                
                                presenceData.details = 'Sign out';
                                break;
                        }
                    } else {
                        presence.setTrayTitle();
                        presence.setActivity();
                        return;
                    }
                    break;
                //Account settings
                //------------------------------------------------------------------------------
                case 'settings':
                case 'profile':
                    presenceData.details = 'Settings';
                    if(path.length > 1) {
                        switch(path[1]) {
                            case 'edit':
                                presenceData.state = 'Edit profile';
                                break;
                            case 'change_password':
                                presenceData.state = 'Change password';
                                break;
                            case 'export_my_data':
                                presenceData.state = 'Export data';
                                break;
                            case 'confirm_deletion':
                                presenceData.state = 'Delete account';
                                break;
                        }
                    }
                    break;
                //My Applets
                //------------------------------------------------------------------------------
                case 'my_applets':
                    presenceData.details = 'My Applets';
                    break;
                //Creating an Applet
                //------------------------------------------------------------------------------
                case 'create':
                    presenceData.details = 'Creating an Applet';
                    if(new URL(window.location).search && document.getElementsByClassName('header').length > 0) {
                        presenceData.smallImageKey = 'writing';
                        presenceData.smallImageText = document.getElementsByClassName('user-step')[0].innerText;

                        presenceData.state = document.getElementsByClassName('header')[0].innerText;
                    }
                    break;
                //Activity
                //------------------------------------------------------------------------------
                case 'activity':
                    presenceData.details = 'Activity';
                    if(path.length > 1) {
                        switch(path[1]) {
                            case 'service':
                                presenceData.state = document.querySelector('h1').innerText;
                                break;
                        }
                    }
                    break;
                //My services
                //------------------------------------------------------------------------------
                case 'date_and_time':
                case 'email':
                case 'email_digest':
                case 'ifttt':
                case 'feed':
                case 'space':
                case 'weather':
                case 'maker_webhooks':
                    presenceData.state = document.querySelector('h1').innerText;
                case 'my_services':
                    presenceData.details = 'My Services';
                    break;
                //Connect services
                //------------------------------------------------------------------------------
                case 'connect':
                    presenceData.details = 'My Services';
                    presenceData.state = `Connect ${document.querySelector('h1').firstElementChild.title} to ${document.querySelector('h1').lastElementChild.title}`;
                    break;
                //Explore
                //------------------------------------------------------------------------------
                case 'discover':
                    presenceData.details = 'Explore';
                    break;
                //Search
                //------------------------------------------------------------------------------
                case 'search':
                    presenceData.smallImageKey = 'search';
                    presenceData.smallImageText = (yield strings).search;
                    
                    presenceData.details = `Searching for "${document.getElementById('search').value}"`;
                    presenceData.state = `Tab: ${document.getElementsByClassName('active')[1].innerText}`;
                    break;
                //Trust & Privacy
                //------------------------------------------------------------------------------
                case 'terms':
                    presenceData.details = 'Privacy Policy & Terms of Use';
                    break;
                //Careers
                //------------------------------------------------------------------------------
                case 'careers':
                    presenceData.details = 'Careers';
                    break;
                //Unknown
                //------------------------------------------------------------------------------
                default:
                    if(document.getElementsByClassName('brand-section').length > 0) {
                        presenceData.details = 'Services';
                        presenceData.state = document.querySelector('h1').innerText;
                    } else {
                        presence.setTrayTitle();
                        presence.setActivity();
                        return;
                    }
                //------------------------------------------------------------------------------
            }
            break;
        //---------------------------------------------------------------------------------------------------------------------
    }

    presence.setActivity(presenceData);
}));
//-----------------------------------------------------------------------------------------------------------------------------------------------------
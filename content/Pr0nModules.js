/* See license.txt for terms of usage */

var Pr0n_Modules = [
     { name        : 'bookmark',
       icon        : 'chrome://pr0n/content/modules/bookmark/images/icon.png',
       includes    : [ "chrome://pr0n/content/modules/bookmark/Pr0nModule_Bookmark.js" ],
       description : 'Your personal bookmarks',
       className   : 'Pr0nModule_Bookmark' },
     { name        : 'share',
       icon        : 'chrome://pr0n/content/modules/share/images/icon.png',
       includes    : [ "chrome://pr0n/content/modules/share/Pr0nModule_Share.js" ],
       description : 'Share contents with the community!',
       className   : 'Pr0nModule_Share' },
     { name        : 'twitter',
       icon        : 'chrome://pr0n/content/modules/twitter/images/icon.png',
       includes    : [ "chrome://pr0n/content/modules/twitter/Pr0nModule_Twitter.js" ],
       description : 'Share contents with Twitters',
       className   : 'Pr0nModule_Twitter' }
];

var Pr0n_Module_Methods = [
    'getNode',              // array|singleItem getNode(Document)
    'init',                 // void init()
    'shutdown',             // void shutdown()
    'enterPrivateBrowsing', // void enterPrivateBrowsing()
    'exitPrivateBrowsing',  // void exitPRivateBrowsing()
    'getPreferenceNode',    // obj({ name: "a", item: array, save(bool func)}) getPreferenceNode(Document)
    'savePreference'        // obj({..} savePreference(Document)
];


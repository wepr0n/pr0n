/* See license.txt for terms of usage */

var Pr0n_Modules = [
     { name        : 'share',
       icon        : 'chrome://pr0n/content/modules/share/images/icon.png',
       includes    : [ "chrome://pr0n/content/modules/share/Pr0nModule_Share.js" ],
       description : 'todo',
       className   : 'Pr0nModule_Share' },
     { name        : 'twitter',
       icon        : 'chrome://pr0n/content/modules/twitter/images/icon.png',
       includes    : [ "chrome://pr0n/content/modules/twitter/Pr0nModule_Twitter.js" ],
       description : 'todo',
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


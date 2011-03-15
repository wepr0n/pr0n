/* See license.txt for terms of usage */

Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

// Gecko 1.9.0/1.9.1 compatibility - add XPCOMUtils.defineLazyServiceGetter
if (!("defineLazyServiceGetter" in XPCOMUtils)) {
    XPCOMUtils.defineLazyServiceGetter = function XPCU_defineLazyServiceGetter(obj, prop, contract, iface) {
        obj.__defineGetter__(prop, function XPCU_serviceGetter() {
            delete obj[prop];
            return obj[prop] = Components.classes[contract]
                                         .getService(Components.interfaces[iface]);
        });
    };
}

// Load dependences:
XPCOMUtils.defineLazyServiceGetter(this, "loader", "@mozilla.org/moz/jssubscript-loader;1", "mozIJSSubScriptLoader");
loader.loadSubScript('chrome://pr0n/content/Pr0nModules.js', this);
loader.loadSubScript('chrome://pr0n/content/Pr0nWindow.js', this);

/**
 * Application startup/shutdown observer, triggers init()/shutdown() methods in Pr0n object.
 * @constructor
 */
function Pr0nInitializer() {}
Pr0nInitializer.prototype = {
    classDescription: "Pr0n initializer",
    contractID: "@wepr0n.com/pr0nStartup;1",
    classID: Components.ID("{d01956c1-55a7-4c99-91a3-37501865c1f6}"),
    _xpcom_categories: [{ category: "app-startup", service: true }],

    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIObserver, Components.interfaces.nsISupportsWeakReference]),

    observe: function(subject, topic, data) {
        switch(topic) {
            case "app-startup":
                let observerService = Components.classes["@mozilla.org/observer-service;1"]
                                                .getService(Components.interfaces.nsIObserverService);
                observerService.addObserver(this, "profile-after-change", true);
                observerService.addObserver(this, "quit-application", true);
                break;
            case "profile-after-change":
                // delayed init for Fennec
                let appInfo = Components.classes["@mozilla.org/xre/app-info;1"]
                                        .getService(Components.interfaces.nsIXULAppInfo);
                if (appInfo.ID != "{6951e739-9936-44eb-84ea-be5ac59b7e59}")
                    Pr0n.init();
                break;
            case "quit-application":
                Pr0n.shutdown();
                break;
        }
    }
};

const PR0N_CONTRIBUTE_URL = 'http://www.wepr0n.com'; // TODO

// Pr0n COmponent
const Pr0n = {
    // properties required for XPCOM registration:
    classDescription: "Pr0n Javascript XPCOM Component",
    classID:          Components.ID("{6951e739-9936-44eb-84ea-be5ac59b7e59}"),
    contractID:       "@wepr0n.com/pr0n;1",

    _xpcom_categories: [{ category: "app-startup", service: true }],

    QueryInterface: XPCOMUtils.generateQI([Components.interfaces.nsIPr0n]),

    // ...component implementation...
    _initialized: false,

    _ww : null,
    _preferences : null,
    _JSON : null,
    _os : null,

    _user : null,

    _modules : [],

    _config: {
        serviceURL : null,
        toolbarInNormalBrowsing : false,
        modules : [],
        modulesParams : {}
    },

    // The listener will call this func when private browing will start:
    init: function() {
        if (this._initialized)
            return;

        this._initialized = true;

        // JSON decoder/encoder:
        this._JSON = Components.classes['@mozilla.org/dom/json;1']
                               .createInstance(Components.interfaces.nsIJSON);

        // Preferences:
        var prefSvc = Components.classes['@mozilla.org/preferences-service;1']
                                .getService(Components.interfaces.nsIPrefService);
        this._preferences = prefSvc.getBranch('extensions.pr0n.');

        // Some params from preferences:
        this._config.toolbarInNormalBrowsing = this._preferences.getBoolPref('inNormalBrowsing');
        try {
            this._config.modules       = this._JSON.decode(this._preferences.getCharPref('modules'));
            this._config.modulesKnown  = this._JSON.decode(this._preferences.getCharPref('modulesKnown'));
            this._config.modulesParams = this._JSON.decode(this._preferences.getCharPref('modulesParams'));
        } catch(e) { dump(e); }

        // Observer:
        this._os = Components.classes['@mozilla.org/observer-service;1']
                             .getService(Components.interfaces.nsIObserverService);
        this._os.addObserver(this, 'private-browsing', false);

        // Add new modules
        var newModules = false;
        for(var i=0; i<Pr0n_Modules.length; i++) {
            if (this._config.modulesKnown.indexOf(Pr0n_Modules[i].name) == -1) {
                if (this._config.modules.indexOf(Pr0n_Modules[i].name) == -1)
                    this._config.modules.push(Pr0n_Modules[i].name);

                this._config.modulesKnown.push(Pr0n_Modules[i].name);
                newModules = true;
            }
        }

        // Load modules:
        modules = Pr0n_Modules;
        for(var i=0; i<modules.length; i++) {
            try {
                for(var l=0; l<modules[i].includes.length; l++)
                    loader.loadSubScript(modules[i].includes[l], this);

                modules[i].obj = eval('this.' + modules[i].className);

                if(this.moduleValidation(modules[i].name,
                                         modules[i].obj) == true)
                    this._modules.push(modules[i]);
                else
                    continue;
            } catch(e) {
                dump(e + '\n');
                continue;
            }

            this._modules[i].enabled = false;

            for(var j=0; j<this._config.modules.length; j++) {
                if(this._modules[i].name == this._config.modules[j]) {
                    this._modules[i].enabled = true;
                    this._modules[i].obj.init();
               }
            }
        }

        // Adding a watcher for new windows:
        this._ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1']
                             .getService(Components.interfaces.nsIWindowWatcher);
        this._ww.registerNotification(this)

        // Activing the current windows:
        var windows = this.getWindows();
        for(var i = 0;i < windows.length; i++) {
            if ('ChromeWindow' in windows[i] &&
                windows[i] instanceof windows[i].ChromeWindow &&
                windows[i].document) {
                new Pr0n_Window(this, windows[i], this._config);
            }
        }

        var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]
                            .getService(Components.interfaces.nsIPrivateBrowsingService);
        if(pbs.privateBrowsingEnabled == true)
            this.privateBrowsingEnter();

        // Save if new modules
        if (newModules)
            this.save();

        // Check first boot:
        this.checkFirstBoot();
    },

    // GetWindows returns the list of any window in the browser:
    getWindows : function() {
        var windows = [];

        var en = this._ww.getWindowEnumerator();
        while (en.hasMoreElements()) {
            var win = en.getNext();
            if (win)
                windows.push(win);
        }

        return windows;
    },

    getPreferences : function(m) {
        return this._config.modulesParams[m];
    },

    getJSON : function() {
        return this._JSON;
    },

    // This function saves data:
    save : function() {
        this._preferences.setBoolPref('inNormalBrowsing', this._config.toolbarInNormalBrowsing);
        try {
            this._preferences.setCharPref('modules',       this._JSON.encode(this._config.modules));
            this._preferences.setCharPref('modulesKnown',  this._JSON.encode(this._config.modulesKnown));
            this._preferences.setCharPref('modulesParams', this._JSON.encode(this._config.modulesParams));
        } catch(e) { dump(e); }

        // refresh the windows:
        var windows = this.getWindows();
        for(var i = 0;i < windows.length; i++) {
            if ('ChromeWindow' in windows[i] &&
                windows[i] instanceof windows[i].ChromeWindow &&
                windows[i].document &&
                windows[i]._Pr0nWindow) {
                windows[i]._Pr0nWindow.refresh();
            }
        }
    },

    savePreference : function(module, data) {
        this._config.modulesParams[module] = data;
        this._preferences.setCharPref('modulesParams', this._JSON.encode(this._config.modulesParams));
    },

    moduleValidation : function(name, obj) {
        for(var i=0; i<Pr0n_Module_Methods.length; i++) {
            if(!(Pr0n_Module_Methods[i] in obj)) {
                return false;
            }
        }

        return true;
    },

    exit : function() {
        // Private browsing? exit
        var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]
                            .getService(Components.interfaces.nsIPrivateBrowsingService);
        if(pbs.privateBrowsingEnabled == true) {
            pbs.privateBrowsingEnabled = false;
            return;
        }

        // Closing all the windows except the first one:
        var windows = this.getWindows();
        var firstWindow;
        for(var i = 0;i < windows.length; i++) {
            if ('ChromeWindow' in windows[i] &&
                windows[i] instanceof windows[i].ChromeWindow &&
                windows[i].document) {
                    if(!firstWindow)
                        firstWindow = windows[i];
                    else
                        windows[i].close();
            }
        }

        if(!firstWindow)
            return;

        var mainWindow = firstWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIWebNavigation)
                         .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                         .rootTreeItem
                         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIDOMWindow);

        mainWindow.getBrowser().loadURI('about:blank');
    },

    inToolbar : function() {
        return this._config.toolbarInNormalBrowsing;
    },

    serverError : function() {
        this.message('The server is busy or is completly broken. Please, contribute!');
    },

    message : function(msg) {
        // Closing all the windows except the first one:
        var windows = this.getWindows();
        var firstWindow;
        for(var i = 0;i < windows.length; i++) {
            if ('ChromeWindow' in windows[i] &&
                windows[i] instanceof windows[i].ChromeWindow &&
                windows[i].document) {
                this.messageWindow(windows[i], msg);
            }
        }
    },

    messageWindow : function(win, msg) {
        var nBox = win.getBrowser().getNotificationBox();

        if (!nBox)
            return;

        var me = this;
        var buttons = [
            {
                label:     "Contribute",
                accessKey: "C",
                popup:     null,
                callback:  function(notificationBar, button) { me.contribute(win); }
            }
        ];

        var oldBar = nBox.getNotificationWithValue("pr0n_bar");

        var bar = nBox.appendNotification(msg, "pr0n_bar",
                                          null,
                                          nBox.PRIORITY_INFO_MEDIUM, buttons);
        bar.type = 'info';
        bar.persistence++;

        if (oldBar)
            nBox.removeNotification(oldBar);

        var eventTimeout = { notify: function(timer) {
            var bar = nBox.getNotificationWithValue("pr0n_bar");
            if (bar)
                nBox.removeNotification(bar);
        } }

        var timer = Components.classes["@mozilla.org/timer;1"]
                                .createInstance(Components.interfaces.nsITimer);
        timer.initWithCallback(eventTimeout, 15000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    },

    contribute : function(win) {
        try {
            var mainWindow = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                             .getInterface(Components.interfaces.nsIWebNavigation)
                             .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                             .rootTreeItem
                             .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                             .getInterface(Components.interfaces.nsIDOMWindow);

            mainWindow.getBrowser().loadURI(PR0N_CONTRIBUTE_URL);
        } catch(e) { dump(e); }
    },

    getModules : function() {
        return this._modules;
    },

    module : function(name) {
        for (var i = 0;i<this._modules.length; i++)
            if (this._modules[i].name == name)
                return this._modules[i].obj;
    },

    privateBrowsingEnter : function() {
        for (var i = 0; i<this._modules.length; i++)
            if (this._modules[i].enabled)
                this._modules[i].obj.enterPrivateBrowsing();
    },

    privateBrowsingExit : function() {
        for (var i = 0; i<this._modules.length; i++)
            if (this._modules[i].enabled)
                this._modules[i].obj.exitPrivateBrowsing();
    },

    observe : function (aSubject, aTopic, aData) {
        switch (aTopic) {
            case 'domwindowopened':
                if ('ChromeWindow' in aSubject &&
                    aSubject instanceof aSubject.ChromeWindow &&
                    aSubject.document) {
                    var me = this;
                    aSubject.addEventListener('load', function() {
                        new Pr0n_Window(me, aSubject, me._config);
                    }, false);

                    if (this.showTutorial) {
                        this.showTutorial = false;
                        this.tutorial(aSubject);
                    }
                }
                break;

            case 'private-browsing':
                if (aData == 'enter')
                   this.privateBrowsingEnter();
                else if (aData == 'exit')
                   this.privateBrowsingExit();
                break;
        }
    },

    checkFirstBoot: function() {
        if (!this._preferences.getBoolPref('firstBoot'))
            return;

        this.showTutorial = true;

        this._preferences.setBoolPref('firstBoot', false);
    },

    tutorial: function(win) {
        win.open('chrome://pr0n/content/tutorial.xul', 'Pr0nTutorial', 'chrome,dialog,centerscreen');
    }
};
Pr0n.wrappedJSObject = Pr0n;

/*
 * Module declaration
 */
function Pr0nComponent() {}
Pr0nComponent.prototype = Pr0n;

if (XPCOMUtils.generateNSGetFactory)
    var NSGetFactory = XPCOMUtils.generateNSGetFactory([Pr0nInitializer, Pr0nComponent]);
else
    var NSGetModule = XPCOMUtils.generateNSGetModule([Pr0nInitializer, Pr0nComponent]);

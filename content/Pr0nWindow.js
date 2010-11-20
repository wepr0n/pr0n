/* See license.txt for terms of usage */

// This object manages any window:
function Pr0n_Window(obj, win, config) {
    this.init(obj, win, config);
}

Pr0n_Window.prototype = {
    _pr0n : null,
    _config : null,

    // XUL Elements:
    _window : null,

    _inPrivateBrowsing : false,
    _initialized : false,

    // Init function:
    init : function(obj, win, config) {
        var me       = this;
        this._pr0n   = obj;
        this._window = win;
        this._config = config;

        this._os = Components.classes['@mozilla.org/observer-service;1']
                             .getService(Components.interfaces.nsIObserverService);
        this._os.addObserver(this, 'private-browsing', false);
        this._os.addObserver(this, 'quit-application', false);

        try {
            var pbs = Components.classes['@mozilla.org/privatebrowsing;1']
                                .getService(Components.interfaces.nsIPrivateBrowsingService);
            this._inPrivateBrowsing = pbs.privateBrowsingEnabled;
        } catch(ex) {
            // ignore exceptions in older versions of Firefox
        }

        // Check/Init the toolbar:
        this.initToolbar();
        this.checkToolbar();

        // Loading of the window:
        win.addEventListener('load', function() { me.windowOnload(); }, false);
        this._window._Pr0nWindow = this;
    },

    refresh : function() {
        var toolbarModule = this._window.document.getElementById('Pr0n-Modules');
        if(!toolbarModule)
            return;

        while(toolbarModule.firstChild)
            toolbarModule.removeChild(toolbarModule.firstChild);

        this.initialized = false;
        this.initToolbar();
        this.checkToolbar();

        var obj = this._window.document.getElementById("nav-bar") ||
                  this._window.document.getElementById("addon-bar");
        if (!obj)
            return;

        var button = this._window.document.getElementById("pr0n-toolbarbutton");
        var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                             .getService().wrappedJSObject;
        if (pr0n.inToolbar()) {
            obj.setAttribute("collapsed", "false");
            obj.insertItem('pr0n-toolbarbutton', null, null, false);

            if (button) {
                button.hidden = false;
                this._window.document.persist(button.id, "collapsed");
            }
        } else if(button) {
            button.hidden = true;
        }
    },

    observe : function (aSubject, aTopic, aData) {
        if (aTopic == 'private-browsing') {
            if (aData == 'enter') {
                this._inPrivateBrowsing = true;
                this.checkToolbar();
            } else if (aData == 'exit') {
                this._inPrivateBrowsing = false;
                this.checkToolbar();
            }
        }

        else if (aTopic == 'quit-application') {
            this._os.removeObserver(this, 'quit-application');
            this._os.removeObserver(this, 'private-browsing');
        }
    },

    windowOnload : function() {
        this._window._Pr0nWindow = this;
        this.initToolbar();
        this.checkToolbar();
    },

    initToolbar : function() {
        if(this.initialized == true)
            return;

        var toolbar = this._window.document.getElementById('Pr0n-Toolbar');
        if(!toolbar)
            return;

        var toolbarModule = this._window.document.getElementById('Pr0n-Modules');
        if(!toolbarModule)
            return;

        // Populating the toolbar:
        var modules = this._pr0n.getModules();
        var first = true;
        for(var i=0; i<modules.length; i++) {
            if(!modules[i].enabled)
                continue;

            var item = modules[i].obj.getNode(this._window.document);
            if(!item)
                continue;

            if (first == true) {
                first = false;
            } else {
                var sep = this._window.document.createElement('toolbarseparator');
                toolbarModule.appendChild(sep);
            }

            if(item instanceof Array) {
                for(var j=0; j<item.length;j++)
                    toolbarModule.appendChild(item[j]);
            }
            else 
                toolbarModule.appendChild(item);

        }

        this.initialized = true;
    },

    checkToolbar : function() {
        if (this._inPrivateBrowsing == true)
            this.showToolbar();
        else
            this.hideToolbar();
    },

    showToolbar : function() {
        var toolbar = this._window.document.getElementById('Pr0n-Toolbar');
        if(!toolbar)
            return;

        toolbar.hidden = false;
    },

    hideToolbar : function() {
        var toolbar = this._window.document.getElementById('Pr0n-Toolbar');
        if(!toolbar)
            return;

        toolbar.hidden = true;
    }
};

// EOF

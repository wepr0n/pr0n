// CONSTANTS //
const PR0N_HOME_URL       = 'http://www.wepr0n.com';
const PR0N_CONTRIBUTE_URL = 'http://www.wepr0n.com'; // TODO
const PR0N_COPYRIGHT      = 'Copyright (c) 2010, pr0n project; All rights reserved.';

// HELPERS //
if(!String.prototype.trim) {
    String.prototype.trim = function() { return this.replace(/^\s+|\s+$/g, ''); };
}

if(!Array.prototype.indexOf) {
    Array.prototype.indexOf = function(elt /*, from*/)
    {
        var len = this.length >>> 0;

        var from = Number(arguments[1]) || 0;
        from = (from < 0)
               ? Math.ceil(from)
               : Math.floor(from);
        if (from < 0)
            from += len;

        for (; from < len; from++)
        {
            if (from in this &&
                this[from] === elt)
                return from;
        }
        return -1;
    };
}

// GENERIC FUNCTIONS //
function Pr0n_home() {
    try {
        var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIWebNavigation)
                         .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                         .rootTreeItem
                         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIDOMWindow);

        mainWindow.getBrowser().loadURI(PR0N_HOME_URL);
    } catch(e) { dump(e); }
}

function Pr0n_contribute() {
    try {
        var mainWindow = window.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIWebNavigation)
                         .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                         .rootTreeItem
                         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIDOMWindow);

        mainWindow.getBrowser().loadURI(PR0N_CONTRIBUTE_URL);
    } catch(e) { dump(e); }
}

function Pr0n_preferences() {
    window.open("chrome://pr0n/content/preferences.xul", 
                "Pr0nOptions", "chrome,dialog,centerscreen,alwaysRaised");
    window.focus();
}

function Pr0n_exit() {
    var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                         .getService().wrappedJSObject;

    pr0n.exit();
}

function Pr0n_open() {
    var pbs = Components.classes["@mozilla.org/privatebrowsing;1"]
                        .getService(Components.interfaces.nsIPrivateBrowsingService);
    pbs.privateBrowsingEnabled = !pbs.privateBrowsingEnabled;

    var obj = document.getElementById("pr0n-toolbarbutton");
    if (!obj) return;

    if (pbs.privateBrowsingEnabled)
        obj.setAttribute("tooltiptext", "Hide pr0n toolbar");
    else
        obj.setAttribute("tooltiptext", "Show pr0n toolbar");
}

function Pr0n_aboutUpdate() {
    document.getElementById("Pr0n-website").setAttribute("value", PR0N_HOME_URL);
    document.getElementById("Pr0n-copyright").setAttribute("value", PR0N_COPYRIGHT);

    try {
        Components.utils.import("resource://gre/modules/AddonManager.jsm");
        AddonManager.getAllAddons(function(aAddons) {
            for (var i=0; i<aAddons.length; i++) {
                if (aAddons[i].id == 'pr0n@wepr0n.com')
                    Pr0n_aboutLoadVersion(aAddons[i].version);
            }
        });
    } catch(e) {
        var extmgr = Components.classes["@mozilla.org/extensions/manager;1"]
                               .getService(Components.interfaces.nsIExtensionManager);
        var em = extmgr.getItemList(Components.interfaces.nsIUpdateItem.TYPE_ANY, { });
        for (var i=0; i < em.length; ++i) {
            var item = em[i];
            if (item.id == "pr0n@wepr0n.com") {
                Pr0n_aboutLoadVersion(item.version);
                break;
            }
        }
    }
}

function Pr0n_aboutLoadVersion(version) {
    document.getElementById("Pr0n-version").setAttribute("value", version);
}

{
    window.addEventListener("load", function() {
        window.removeEventListener("load", arguments.callee, false);
        var obj = document.getElementById("nav-bar") ||
                  document.getElementById("addon-bar");
        if (!obj)
            return;

        var button = document.getElementById("pr0n-toolbarbutton");
        var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                             .getService().wrappedJSObject;
        if (pr0n.inToolbar()) {
            obj.setAttribute("collapsed", "false");
            obj.insertItem('pr0n-toolbarbutton', null, null, false);

            if (button) {
                button.hidden = false;
                document.persist(button.id, "collapsed");
            }
        } else if(button) {
            button.hidden = true;
        }

    }, false);
}


// EOF

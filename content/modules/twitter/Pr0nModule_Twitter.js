var Pr0nModule_Twitter = {
    // Common functions ------------------------------------------------------
    getNode : function(doc) {
        var items=[];
        var item;

        // twitter button ----------------------------------------------------
        item = doc.createElement('toolbarbutton');
        item.setAttribute('id',          'Pr0n-Toolbar-Twitter');
        item.setAttribute('class',       'pr0n-button-menu');
        item.setAttribute('type',        'menu');
        item.setAttribute('image',       'chrome://pr0n/content/modules/twitter/images/icon.png');
        item.setAttribute('tooltiptext', 'Tweet this website!');
        items.push(item);

        // Panel for sharing is composed by a grid
        var panel = doc.createElement('panel');
        panel.setAttribute('id',           'Pr0n-Panel-Twitter');
        panel.setAttribute('noautofocus',  'true');
        panel.setAttribute('class',        'pr0n-panel');
        panel.setAttribute('position',     'after_start');
        panel.setAttribute('ignorekeys',   'true');
        panel.setAttribute('orient',       'vertical');
        panel.setAttribute('onpopupshown', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                     '.getService().wrappedJSObject' +
                                                     '.module("twitter").prepareTwitterPanel(document, window);' +
                                           'document.getElementById("pr0n-twitter-browser").focus();');
        item.appendChild(panel);

        // Browser
        var browser = doc.createElement('browser');
        browser.setAttribute('id',     'pr0n-twitter-browser');
        browser.setAttribute('type',   'content');
        browser.setAttribute('flex',   '1');
        browser.setAttribute('width',  '600px');
        browser.setAttribute('height', '300px');
        panel.appendChild(browser);

        return items;
    },

    init : function() {
    },

    shutdown : function() {
    },

    enterPrivateBrowsing : function() {
    },

    exitPrivateBrowsing : function() {
    },

    getPreferenceNode : function(doc) {
    },

    savePreference : function(doc) {
        return {};
    },

    // Twitter function -------------------------------------------------------
    prepareTwitterPanel : function(doc, win) {
        var mainWindow = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIWebNavigation)
                         .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                         .rootTreeItem
                         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIDOMWindow);

        var browser = doc.getElementById("pr0n-twitter-browser");
        if (!browser.getAttribute('pr0nHasListener')) {
            browser.addProgressListener(new Pr0nTwitterBrowserListener(doc),
                                        Components.interfaces.nsIWebProgress.NOTIFY_LOCATION);
            browser.setAttribute('pr0nHasListener', 'true');
        }

        // Header line
        var label = doc.getElementById("pr0n-twitter-label");
        if (label)
            label.parentNode.removeChild(label);

        label = doc.createElement('label');
        label.setAttribute('id',    'pr0n-twitter-label');
        label.setAttribute('value', 'Loading...');
        label.setAttribute('class', 'pr0n-panel-title');
        doc.getElementById('Pr0n-Panel-Twitter').appendChild(label);

        browser.loadURI('http://twitter.com/share?url=' +
                        encodeURIComponent(mainWindow.getBrowser().currentURI.spec) +
                        '&text=' + encodeURIComponent('#pr0n') +
                        '&count=vertical&via=wepr0n', null, null);
    }
};

function Pr0nTwitterBrowserListener (doc) {
    this.doc = doc;
    this.request = null;
}

Pr0nTwitterBrowserListener.prototype = {

    QueryInterface: function (aIID) {
        var CI = Components.interfaces;

        if (aIID.equals (CI.nsIWebProgressListener) ||
            aIID.equals (CI.nsISupportsWeakReference) ||
            aIID.equals (CI.nsIXULBrowserWindow) ||
            aIID.equals (CI.nsISupports)) {
            return this;
        }

        throw Components.results.NS_NOINTERFACE;
    },

    onStateChange: function (aProgress, aRequest, aStateFlags, aStatus) {
        if (!this.doc)
            return 0;

        if (!aRequest)
            return 0;

        if (!this.request)
            this.request = aRequest;

        if (this.request != aRequest)
            return 0;

        var label   = this.doc.getElementById("pr0n-twitter-label");

        if ((aStateFlags & Components.interfaces.nsIWebProgressListener.STATE_STOP) != 0) {
            if (label)
                label.parentNode.removeChild(label);
            this.request = null;
        }

        return 0;
    },

    onProgressChange: function (aWebProgress, aRequest, aCurSelfProgress,
        aMaxSelfProgress, aCurTotalProgress, aMaxTotalProgress) {
        return 0;
    },

    onLocationChange: function (aWebProgress, aRequest, aLocation) {
        return 0;
    },

    onStatusChange: function (aWebProgress, aRequest, aStatus, aMessage) {
        return 0;
    },

    onSecurityChange: function (aWebProgress, aRequest, aState) {
        return 0;
    }
};

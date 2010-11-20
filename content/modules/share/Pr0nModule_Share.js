var Pr0nModule_Share = {
    _config   : null,
    _JSON     : null,
    _ww       : null,
    _timer    : null,
    _tagTimer : null,
    _offline  : false,

    _mainTags : [ 'image', 'video', 'text' ],

    _abuseReasons : [ { text: "This is illegal",        value: "illegal" },
                      { text: "This is not pr0n!",      value: "notpr0n" },
                      { text: "This is not accessible", value: "error"   } ],

    _windows       : [],
    _currentWindow : null,

    _maxTimer : 30000,

    _inPrivateBrowsing : false,

    // Common functions ------------------------------------------------------
    getNode : function(doc) {
        var items=[];
        var item;

        // Sharing button ----------------------------------------------------
        item = doc.createElement('toolbarbutton');
        item.setAttribute('id',          'Pr0n-Toolbar-Share');
        item.setAttribute('class',       'pr0n-button-menu');
        item.setAttribute('type',        'menu');
        item.setAttribute('image',       'chrome://pr0n/content/modules/share/images/icon.png');
        item.setAttribute('tooltiptext', 'Share this website!');
        items.push(item);

        // Panel for sharing is composed by a grid
        var panel = doc.createElement('panel');
        panel.setAttribute('id',           'Pr0n-Panel-Share');
        panel.setAttribute('noautofocus',  'true');
        panel.setAttribute('class',        'pr0n-panel');
        panel.setAttribute('position',     'after_start');
        panel.setAttribute('ignorekeys',   'true');
        panel.setAttribute('orient',       'vertical');
        panel.setAttribute('onpopupshown', 'if (this.getAttribute("pr0nInit") != "true") {' +
                                               'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                     '.getService().wrappedJSObject' +
                                                     '.module("share").prepareSharePanel(document, window);' +
                                               'this.setAttribute("pr0nInit", "true");' +
                                            '}');
        panel.setAttribute('onpopuphidden', 'if(this.state == "closed") this.setAttribute("pr0nInit", "false");');
        item.appendChild(panel);

        var grid = doc.createElement('grid');
        grid.setAttribute('flex', '1');
        panel.appendChild(grid);

        var columns = doc.createElement('columns');
        grid.appendChild(columns);

        var column;
        column = doc.createElement('column');
        columns.appendChild(column);

        column = doc.createElement('column');
        column.setAttribute('flex', '1');
        columns.appendChild(column);

        var rows = doc.createElement('rows');
        grid.appendChild(rows);

        // Header line
        var label;
        label = doc.createElement('label');
        label.setAttribute('value', 'Share this webpage');
        label.setAttribute('class', 'pr0n-panel-title');
        rows.appendChild(label);

        // First row - title:
        var row;
        row = doc.createElement('row');
        row.setAttribute('align', 'center');
        rows.appendChild(row);

        label = doc.createElement('label');
        label.setAttribute('value',   'Title:');
        label.setAttribute('control', 'pr0n-share-name');
        row.appendChild(label);

        var textbox;
        textbox = doc.createElement('textbox');
        textbox.setAttribute('id',         'pr0n-share-name');
        textbox.setAttribute('class',      'pr0n-input-text');
        textbox.setAttribute('flex',       '1');
        textbox.setAttribute('onkeypress', 'if (event.keyCode == 13) ' +
                                               'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                         '.getService().wrappedJSObject' +
                                                         '.module("share").share(document, window);' +
                                           'document.getElementById("Pr0n-Panel-Share").setAttribute("pr0nToHide", "false");' +
                                           'return true;');
        row.appendChild(textbox);

        // Second line - tags:
        row = doc.createElement('row');
        row.setAttribute('align', 'center');
        rows.appendChild(row);

        label = doc.createElement('label');
        label.setAttribute('value',   'URL:');
        label.setAttribute('control', 'pr0n-share-url');
        row.appendChild(label);

        textbox = doc.createElement('textbox');
        textbox.setAttribute('id',         'pr0n-share-url');
        textbox.setAttribute('class',      'pr0n-input-text');
        textbox.setAttribute('flex',       '1');
        textbox.setAttribute('onkeypress', 'if (event.keyCode == 13) ' +
                                               'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                         '.getService().wrappedJSObject' +
                                                         '.module("share").share(document, window);' +
                                           'document.getElementById("Pr0n-Panel-Share").setAttribute("pr0nToHide", "false");' +
                                           'return true;');
        row.appendChild(textbox);

        // Third line - type:
        row = doc.createElement('row');
        row.setAttribute('align', 'center');
        rows.appendChild(row);

        label = doc.createElement('label');
        label.setAttribute('value', 'Type:');
        row.appendChild(label);

        var type = doc.createElement('radiogroup');
        type.setAttribute('id', 'pr0n-share-main-tags');
        row.appendChild(type);

        hbox = doc.createElement('hbox');
        type.appendChild(hbox);

        for (var i=0; i<this._mainTags.length; i++) {
            var radio = doc.createElement('radio');
            radio.setAttribute('label', this._mainTags[i]);
            hbox.appendChild(radio);
        }

        var radio = doc.createElement('radio');
        radio.setAttribute('selected', 'true');
        radio.setAttribute('label', 'n/a');
        hbox.appendChild(radio);

        // 4th line - tags:
        row = doc.createElement('row');
        row.setAttribute('align', 'center');
        rows.appendChild(row);

        label = doc.createElement('label');
        label.setAttribute('value',   'Tags:');
        label.setAttribute('control', 'pr0n-share-tags');
        row.appendChild(label);

        textbox = doc.createElement('textbox');
        textbox.setAttribute('id',                     'pr0n-share-tags');
        textbox.setAttribute('class',                  'pr0n-input-text');
        textbox.setAttribute('type',                   'autocomplete');
        textbox.setAttribute('flex',                   '1');
        textbox.setAttribute('autocompletesearch',     'pr0n-tags-autocomplete');
        textbox.setAttribute('autocompletesearchparam', this.JSON().encode(this.tags()));
        textbox.setAttribute('completedefaultindex',   'true');
        textbox.setAttribute('tabscrolling',           'true');
        textbox.setAttribute('showcommentcolumn',      'true');
        textbox.setAttribute('emptytext',              'Separate tags with commas');
        textbox.setAttribute('onkeypress',             'if (event.keyCode == 13) ' +
                                                           'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                                     '.getService().wrappedJSObject' +
                                                                     '.module("share").share(document, window);' +
                                                       'document.getElementById("Pr0n-Panel-Share").setAttribute("pr0nToHide", "false");' +
                                                       'return true;');
        row.appendChild(textbox);

        // Buttons in the end of panel:
        var hbox;
        hbox = doc.createElement('hbox');
        hbox.setAttribute('pack', 'end');
        panel.appendChild(hbox);

        var button;
        button = doc.createElement('button');
        button.setAttribute('class',     'pr0n-button');
        button.setAttribute('label',     'Cancel');
        button.setAttribute('oncommand', 'document.getElementById("Pr0n-Panel-Share").hidePopup();');
        hbox.appendChild(button);

        button = doc.createElement('button');
        button.setAttribute('id',        'pr0n-share-button');
        button.setAttribute('class',     'pr0n-button');
        button.setAttribute('label',     '');
        button.setAttribute('default',   'true');
        button.setAttribute('oncommand', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                   '.getService().wrappedJSObject' +
                                                   '.module("share").share(document, window);');
        hbox.appendChild(button);

        // Open shared url button --------------------------------------------
        item = doc.createElement('toolbarbutton');
        item.setAttribute('id',          'Pr0n-Toolbar-ShareOpen');
        item.setAttribute('image',       'chrome://pr0n/content/modules/share/images/open.png');
        item.setAttribute('tooltiptext', 'Open a website shared by the community');
        item.setAttribute('oncommand',   'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                   '.getService().wrappedJSObject' +
                                                   '.module("share").open(document, window, null);');
        items.push(item);

        item = doc.createElement('toolbarbutton');
        item.setAttribute('id',          'Pr0n-Toolbar-ShareOpenMenu');
        item.setAttribute('class',       'pr0n-button-menu');
        item.setAttribute('type',        'menu');
        item.setAttribute('tooltiptext', 'Open tag panel');
        items.push(item);

        // Panel is composed by a grid
        panel = doc.createElement('panel');
        panel.setAttribute('id',           'Pr0n-Panel-Share-Open');
        panel.setAttribute('class',        'pr0n-panel');
        panel.setAttribute('position',     'after_start');
        panel.setAttribute('ignorekeys',   'true');
        panel.setAttribute('orient',       'vertical');
        panel.setAttribute('onpopupshown', 'if (this.getAttribute("pr0nInit") != "true") {' +
                                               'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                     '.getService().wrappedJSObject' +
                                                     '.module("share").prepareOpenPanel(document, window);' +
                                               'this.setAttribute("pr0nInit", "true");' +
                                            '}');
        panel.setAttribute('onpopuphidden', 'if(this.state == "closed") this.setAttribute("pr0nInit", "false");');
        item.appendChild(panel);

        // Header line
        label = doc.createElement('label');
        label.setAttribute('value', 'Configure your preferred tags');
        label.setAttribute('class', 'pr0n-panel-title');
        panel.appendChild(label);

        // Line for tags:
        hbox = doc.createElement('hbox');
        hbox.setAttribute('flex', '1');
        panel.appendChild(hbox);

        label = doc.createElement('label');
        label.setAttribute('value',   'Tags:');
        label.setAttribute('control', 'pr0n-open-tags');
        hbox.appendChild(label);

        textbox = doc.createElement('textbox');
        textbox.setAttribute('id',                     'pr0n-open-tags');
        textbox.setAttribute('class',                  'pr0n-input-text');
        textbox.setAttribute('type',                   'autocomplete');
        textbox.setAttribute('flex',                   '1');
        textbox.setAttribute('autocompletesearch',     'pr0n-tags-autocomplete');
        textbox.setAttribute('autocompletesearchparam', this.JSON().encode(this.tags()));
        textbox.setAttribute('completedefaultindex',   'true');
        textbox.setAttribute('tabscrolling',           'true');
        textbox.setAttribute('showcommentcolumn',      'true');
        textbox.setAttribute('emptytext',              'Separate tags with commas');
        textbox.setAttribute('onkeypress',             'if (event.keyCode == 13) ' +
                                                           'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                                     '.getService().wrappedJSObject' +
                                                                     '.module("share").open(document, window, null);' +
                                                       'return true;');
        hbox.appendChild(textbox);

        // Main tags:
        hbox = doc.createElement('hbox');
        hbox.setAttribute('flex', '1');
        panel.appendChild(hbox);

        label.setAttribute('value', 'Type:');
        hbox.appendChild(label);

        var type = doc.createElement('radiogroup');
        type.setAttribute('id', 'pr0n-share-open-main-tags');
        hbox.appendChild(type);

        var typebox = doc.createElement('hbox');
        type.appendChild(typebox);

        for (var i=0; i<this._mainTags.length; i++) {
            var radio = doc.createElement('radio');
            radio.setAttribute('label', this._mainTags[i]);
            typebox.appendChild(radio);
        }

        var radio = doc.createElement('radio');
        radio.setAttribute('selected', 'true');
        radio.setAttribute('label', 'any');
        typebox.appendChild(radio);

        // Grid for tags
        grid = doc.createElement('grid');
        grid.setAttribute('flex', '1');
        panel.appendChild(grid);

        columns = doc.createElement('columns');
        grid.appendChild(columns);

        column = doc.createElement('column');
        column.setAttribute('flex', '1');
        columns.appendChild(column);

        column = doc.createElement('column');
        column.setAttribute('flex', '1');
        columns.appendChild(column);

        column = doc.createElement('column');
        column.setAttribute('flex', '1');
        columns.appendChild(column);

        rows = doc.createElement('rows');
        rows.setAttribute('id', 'pr0n-panel-open-rows');
        rows.setAttribute('pr0n-max-tags', '9');
        grid.appendChild(rows);

        // More tags:
        hbox = doc.createElement('hbox');
        hbox.setAttribute('pack', 'end');
        panel.appendChild(hbox);

        button = doc.createElement('button');
        button.setAttribute('id',        'pr0n-share-moretags-button');
        button.setAttribute('class',     'pr0n-button');
        button.setAttribute('label',     'More tags');
        button.setAttribute('oncommand', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                   '.getService().wrappedJSObject' +
                                                   '.module("share").moreTagsOpenPanel(document, window);');
        hbox.appendChild(button);

        // Buttons in the end of panel:
        hbox = doc.createElement('hbox');
        hbox.setAttribute('pack', 'end');
        panel.appendChild(hbox);

        button = doc.createElement('button');
        button.setAttribute('id',        'pr0n-share-refresh-button');
        button.setAttribute('class',     'pr0n-button');
        button.setAttribute('label',     'Refresh tags');
        button.setAttribute('oncommand', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                   '.getService().wrappedJSObject' +
                                                   '.module("share").refreshOpenPanel(document, window);');
        hbox.appendChild(button);

        button = doc.createElement('button');
        button.setAttribute('id',        'pr0n-share-open-button');
        button.setAttribute('class',     'pr0n-button');
        button.setAttribute('label',     'Open');
        button.setAttribute('default',   'true');
        button.setAttribute('oncommand', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                   '.getService().wrappedJSObject' +
                                                   '.module("share").open(document, window, null);');
        hbox.appendChild(button);

        // Rate icons ------------------------------------------------------
        var sep = doc.createElement('toolbarseparator');
        items.push(sep);

        var vbox = doc.createElement('vbox');
        items.push(vbox);

        var spacer = doc.createElement('label');
        spacer.setAttribute('flex', '1');
        vbox.appendChild(spacer);

        var box = doc.createElement('hbox');
        vbox.appendChild(box);

        var label = doc.createElement('label');
        label.setAttribute('id',    'pr0n-share-rate');
        label.setAttribute('value', 'Rate: 0.00');
        label.setAttribute('style', 'color: #fff');
        box.appendChild(label);

        spacer = doc.createElement('label');
        spacer.setAttribute('flex', '1');
        vbox.appendChild(spacer);

        item = doc.createElement('toolbaritem');
        items.push(item);

        vbox = doc.createElement('vbox');
        item.appendChild(vbox);

        spacer = doc.createElement('label');
        spacer.setAttribute('flex', '1');
        vbox.appendChild(spacer);

        var ratelist = doc.createElement('hbox');
        vbox.appendChild(ratelist);

        for (var i=0; i<5; i++) {
            var image = doc.createElement('image');
            image.setAttribute('id', 'pr0n-share-rate-' + i);
            image.setAttribute('src', 'chrome://pr0n/content/modules/share/images/rating_off.png');
            image.setAttribute('onmouseover', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                 '.getService().wrappedJSObject' +
                                                 '.module("share").rateOver(this, document, window);');
            image.setAttribute('onmouseout', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                 '.getService().wrappedJSObject' +
                                                 '.module("share").rateOut(this, document, window);');
            image.setAttribute('onclick', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                 '.getService().wrappedJSObject' +
                                                 '.module("share").rateClick(this, document, window);');
            ratelist.appendChild(image);
        }

        spacer = doc.createElement('label');
        spacer.setAttribute('flex', '1');
        vbox.appendChild(spacer);

        var sep = doc.createElement('toolbarseparator');
        items.push(sep);

        // Abuse button ------------------------------------------------------
        item = doc.createElement('toolbarbutton');
        item.setAttribute('id',          'Pr0n-Toolbar-Share-Abuse');
        item.setAttribute('class',       'pr0n-button-menu');
        item.setAttribute('type',        'menu');
        item.setAttribute('image',       'chrome://pr0n/content/modules/share/images/abuse.png');
        item.setAttribute('tooltiptext', 'This site is wrong!');
        items.push(item);

        // Panel for sharing is composed by a grid
        var panel = doc.createElement('panel');
        panel.setAttribute('id',           'Pr0n-Panel-Share-Abuse');
        panel.setAttribute('noautofocus',  'true');
        panel.setAttribute('class',        'pr0n-panel');
        panel.setAttribute('position',     'after_start');
        panel.setAttribute('ignorekeys',   'true');
        panel.setAttribute('orient',       'vertical');
        panel.setAttribute('onpopupshown', 'if (this.getAttribute("pr0nInit") != "true") {' +
                                               'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                     '.getService().wrappedJSObject' +
                                                     '.module("share").prepareAbusePanel(document, window);' +
                                            '}');
        item.appendChild(panel);

        // Header line
        label = doc.createElement('label');
        label.setAttribute('value', 'This webpage is wrong!');
        label.setAttribute('class', 'pr0n-panel-title');
        panel.appendChild(label);

        var abuseGroup = doc.createElement('radiogroup');
        abuseGroup.setAttribute('id', 'pr0n-share-abuse-groups');
        panel.appendChild(abuseGroup);

        // List of reasons:
        for (var i=0; i<this._abuseReasons.length; i++) {
            var radio = doc.createElement('radio');
            radio.setAttribute('label', this._abuseReasons[i].text);
            abuseGroup.appendChild(radio);
        }

        // Buttons in the end of panel:
        var hbox;
        hbox = doc.createElement('hbox');
        hbox.setAttribute('pack', 'end');
        panel.appendChild(hbox);

        var button;
        button = doc.createElement('button');
        button.setAttribute('class',     'pr0n-button');
        button.setAttribute('label',     'Cancel');
        button.setAttribute('oncommand', 'document.getElementById("Pr0n-Panel-Share-Abuse").hidePopup();');
        hbox.appendChild(button);

        button = doc.createElement('button');
        button.setAttribute('id',        'pr0n-share-button-abuse');
        button.setAttribute('class',     'pr0n-button');
        button.setAttribute('label',     '');
        button.setAttribute('default',   'true');
        button.setAttribute('oncommand', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                   '.getService().wrappedJSObject' +
                                                   '.module("share").abuse(document, window);');
        hbox.appendChild(button);

        // Tags strings ------------------------------------------------------
        item = doc.createElement('toolbaritem');
        items.push(item);

        var taglist = doc.createElement('hbox');
        taglist.setAttribute('id','pr0n-share-tags-list');
        item.appendChild(taglist);

        // Refresh of tags --------------------------------------------------
        if (!this._tagTimer) {
            var me = this;
            var evnt = { notify: function(timer) { if (me._offline == false) me.tagsRefresh(); } }
            this._tagTimer = Components.classes["@mozilla.org/timer;1"]
                                       .createInstance(Components.interfaces.nsITimer);
            this._tagTimer.initWithCallback(evnt, 1200000 /* 20 minutes */,
                                            Components.interfaces.nsITimer.TYPE_ONE_SHOT);

            if (this.tags().length == 0)
                this.tagsRefresh();
        }

        return items;
    },

    init : function() {
        this.registerWindows();

        var obsService = Components.classes["@mozilla.org/observer-service;1"]
                                   .getService(Components.interfaces.nsIObserverService);
        obsService.addObserver(this, "network:offline-status-changed", false);

        var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                                  .getService(Components.interfaces.nsIIOService2);
        this._offline = ioService.offline;
    },

    shutdown : function() {
        var obsService = Components.classes["@mozilla.org/observer-service;1"]
                                   .getService(Components.interfaces.nsIObserverService);
        obsService.removeObserver(this, "network:offline-status-changed");
    },

    enterPrivateBrowsing : function() {
        this._inPrivateBrowsing = true;

        if (this._timer == null) {
            this._timer = Components.classes["@mozilla.org/timer;1"]
                                    .createInstance(Components.interfaces.nsITimer);
            this._timer.init(this, this._maxTimer / 2, Components.interfaces.nsITimer.TYPE_REPEATING_SLACK);
        }
    },

    exitPrivateBrowsing : function() {
        this._inPrivateBrowsing = false;
    },

    registerWindows : function() {
        if (this._ww)
            return;

        if (this._ww == null)
            this._ww = Components.classes['@mozilla.org/embedcomp/window-watcher;1']
                                 .getService(Components.interfaces.nsIWindowWatcher);

        this._ww.registerNotification(this)
        this._windows = [];

        var en = this._ww.getWindowEnumerator();
        while (en.hasMoreElements()) {
            var win = en.getNext();
            if (win)
                this.windowNew(win);
        }
    },

    getPreferenceNode : function(doc) {
        var items = [];

        var item = doc.createElement('groupbox');
        item.setAttribute('orient', 'vertical');
        items[0] = item;

        var caption = doc.createElement('caption');
        caption.setAttribute('label', 'Generic use');
        item.appendChild(caption);

        var autoPBrowsing = doc.createElement('checkbox');
        autoPBrowsing.setAttribute('id',      'pr0n-share-auto-pbrowsing');
        autoPBrowsing.setAttribute('checked', this.autoPBrowsing());
        autoPBrowsing.setAttribute('label',   'Auto share when in Private Browsing');
        item.appendChild(autoPBrowsing);

        var me = this;
        return { name  : "Share",
                 items : items };
    },

    savePreference : function(doc) {
        obj = { autoPBrowsing : doc.getElementById('pr0n-share-auto-pbrowsing').checked,
                url           : this.url(),
                tags          : this.tags(),
                preferredTags : this.preferredTags() };
        this._config = null;
        return obj;
    },

    save : function() {
        var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                             .getService().wrappedJSObject;

        var obj = { autoPBrowsing : this.autoPBrowsing(),
                    url           : this.url(),
                    tags          : this.tags(),
                    preferredTags : this.preferredTags() };
        pr0n.savePreference('share', obj);
    },

    // Other stuff ----------------------------------------------------------
    buttonProgress : function(button, progress, str, img) {
        if (progress == true) {
            button.image = 'chrome://pr0n/content/modules/share/images/loader.gif';
            button.label = '';
        } else if (str != null) {
            button.image = '';
            button.label = str;
        } else if (img != null) {
            button.image = img;
            button.label = '';
        }
    },

    autoPBrowsing : function() {
        if (this._config == null) {
            var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                                 .getService().wrappedJSObject;
            this._config = pr0n.getPreferences('share');
        }

        if (this._config)
            return this._config.autoPBrowsing;

        return true;
    },

    url : function() {
        if (this._config == null) {
            var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                                 .getService().wrappedJSObject;
            this._config = pr0n.getPreferences('share');
        }

        return this._config.url;
    },

    tags : function() {
        if (this._config == null) {
            var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                                 .getService().wrappedJSObject;
            this._config = pr0n.getPreferences('share');
        }

        if (this._config.tags instanceof Array)
            return this._config.tags;
        else
            return [];
    },

    preferredTags : function() {
        if (this._config == null) {
            var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                                 .getService().wrappedJSObject;
            this._config = pr0n.getPreferences('share');
        }

        if (this._config.preferredTags instanceof Array)
            return this._config.preferredTags;
        else
            return [];
    },

    JSON : function() {
        if (this._JSON == null) {
            var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                                 .getService().wrappedJSObject;
            this._JSON = pr0n.getJSON();
        }

        return this._JSON;
    },

    // Open function --------------------------------------------------------
    _cache : [],

    open : function(doc, win, label) {
        this.buttonProgress(doc.getElementById('pr0n-share-open-button'), true, 'Open', null);
        this.buttonProgress(doc.getElementById('Pr0n-Toolbar-ShareOpen'), true, null, 'chrome://pr0n/content/modules/share/images/open.png');

        if (label == null) {
            var xul = doc.getElementById('pr0n-open-tags');
            var tArray = [];

            if (!xul || xul.value == undefined) {
                tArray = this.preferredTags();
            } else {
                var value = '';

                if (xul && xul.value)
                    value = xul.value;

                // Parsing tags:
                var tags = value.split(',');

                for (var i=0; i<tags.length; i++) {
                    var t = tags[i].trim();
                    if (t != '' && tArray.indexOf(t) == -1)
                        tArray.push(t.toLowerCase());
                }
            }

            var radiogroup = doc.getElementById('pr0n-share-open-main-tags');
            var mtagid = radiogroup.selectedIndex;
            if (mtagid >= 0 && mtagid < this._mainTags.length)
                tArray.push(this._mainTags[mtagid]);

            tArray.sort();
        } else {
            tArray = [ label.getAttribute('value') ];
        }

        var preferredTags = this.preferredTags();
        var changed = false;

        // Comparing with old preferred tags:
        if (tArray.length != preferredTags.length) {
            changed = true;
        } else {
            for (var i=0; i<tArray.length; i++) {
                if (tArray[i] != preferredTags[i]) {
                    changed = true;
                }
            }
        }

        // Do something:
        if (this._cache.length == 0 || changed) {
            this._config.preferredTags = tArray;
            this.save();

            this.openReal(doc, win);
        } else {
            var url = this._cache.pop();
            this.openUrl(doc, win, url);

            var popup = doc.getElementById("Pr0n-Panel-Share-Open");
            if (popup && popup.hidePopup)
                popup.hidePopup();
        }
    },

    openReal : function(doc, win) {
        this._cache = [];

        var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                            .createInstance(Components.interfaces.nsIXMLHttpRequest);

        var preferredTags = this.preferredTags();
        var query = '';
        for (var i=0; i<preferredTags.length; i++)
            query += (i != 0 ? '&' : '') + 'tag=' +
                     encodeURIComponent(preferredTags[i]).replace(/!/g, '%21')
                                                         .replace(/'/g, '%27')
                                                         .replace(/\(/g, '%28')
                                                         .replace(/\)/g, '%29')
                                                         .replace(/\*/g, '%2A');

        req.open('GET', this.url() + '?version=0.2&' + query, true);

        var me = this;
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                try {
                    var obj = me.JSON().decode(req.responseText);
                    if (obj.success != true) {
                        dump("Obj success == false\n");
                        var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                                             .getService().wrappedJSObject.serverError();
                        me.buttonProgress(doc.getElementById('Pr0n-Toolbar-ShareOpen'), false,
                                          null, 'chrome://pr0n/content/modules/share/images/open.png');
                        return;
                    }

                    if (obj.url instanceof Array) {
                        me._cache = obj.url;
                        var url = me._cache.pop();
                        me.openUrl(doc, win, url);
                    } else {
                        me.noResults(doc);
                    }

                } catch(e) {
                    dump(me.url() + '?version=0.2&' + query + "\n" + req.responseText + " - " + e + '\n');
                    var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                                         .getService().wrappedJSObject.serverError();
                    me.buttonProgress(doc.getElementById('Pr0n-Toolbar-ShareOpen'), false,
                                      null, 'chrome://pr0n/content/modules/share/images/open.png');
                }

                // Close the popup:
                var popup = doc.getElementById("Pr0n-Panel-Share-Open");
                if (popup && popup.hidePopup)
                    popup.hidePopup();
            }
        }

        req.send(null);
    },

    openUrl : function(doc, win, url) {
        this.buttonProgress(doc.getElementById('Pr0n-Toolbar-ShareOpen'), false, null, 'chrome://pr0n/content/modules/share/images/open.png');

        var mainWindow = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIWebNavigation)
                            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                            .rootTreeItem
                            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIDOMWindow);

        mainWindow.getBrowser().loadURI(url.url);

        for (var i=0; i < this._windows.length; i++) {
            if (this._windows[i].win == this._currentWindow) {
                this._windows[i].tags   = url.tags;
                this._windows[i].rate   = url.rate;
                this._windows[i].newUrl = url.url;
                break;
            }
        }
    },

    prepareOpenPanel : function(doc, win) {
        // The rows of the grid:
        var rows = doc.getElementById('pr0n-panel-open-rows');
        while(rows.firstChild)
           rows.removeChild(rows.firstChild);

        var maxTags = rows.getAttribute('pr0n-max-tags');

        // Checking tags:
        var t = this.tags();
        var preferredTags = this.preferredTags();
        var row;

        var radiogroup = doc.getElementById('pr0n-share-open-main-tags');
        for(var i=0; i<preferredTags.length; i++) {
            var index = this._mainTags.indexOf(preferredTags[i]);
            if (index != -1) {
                radiogroup.selectedIndex = this._mainTags.indexOf(preferredTags[i]);
                break;
            }
        }

        var tags = [];
        for(var i=0; i<preferredTags.length; i++) {
            if (this._mainTags.indexOf(preferredTags[i]) != -1)
                continue;

            tags.push(preferredTags[i]);
        }

        for(var i=0; i<t.length; i++) {
            if (this._mainTags.indexOf(t[i]) != -1)
                continue;

            if (tags.indexOf(t[i]) == -1)
                tags.push(t[i]);
        }

        if (maxTags < tags.length) {
            tags = tags.splice(0, maxTags);

            var button = doc.getElementById('pr0n-share-moretags-button');
            button.style.visibility = 'visible';
        } else {
            var button = doc.getElementById('pr0n-share-moretags-button');
            button.style.visibility = 'hidden';
        }

        tags.sort();

        for(var i=0, p=0; i<tags.length; i++) {
            if (p == 0 || (p % 3) == 0) {
                row = doc.createElement('row');
                row.setAttribute('align', 'center');
                rows.appendChild(row);
            }

            var checkbox = doc.createElement('checkbox');
            checkbox.setAttribute('label',   tags[i]);
            checkbox.setAttribute('checked', (preferredTags.indexOf(tags[i]) != -1));
            checkbox.setAttribute('onclick', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                       '.getService().wrappedJSObject' +
                                                       '.module("share").checkboxClick(document, window, this);');
            row.appendChild(checkbox);
            p++;
        }

        // the textbox for tags:
        var str = '';
        var j=0;
        for (var i=0; i<preferredTags.length; i++) {
            if (this._mainTags.indexOf(preferredTags[i]) != -1)
                continue;

            str += (j != 0 ? ', ' : '') + preferredTags[i];
            j++;
        }

        doc.getElementById('pr0n-open-tags').value = str;
        doc.getElementById("pr0n-open-tags").focus();

        this.buttonProgress(doc.getElementById('pr0n-share-open-button'), false, 'Open', null);
        this.buttonProgress(doc.getElementById('Pr0n-Toolbar-ShareOpen'), false, null, 'chrome://pr0n/content/modules/share/images/open.png');
        this.buttonProgress(doc.getElementById('pr0n-share-refresh-button'), false, 'Refresh tags', null);
    },

    moreTagsOpenPanel : function(doc, win) {
        this._config.preferredTags = [];
        this.save();

        var rows = doc.getElementById('pr0n-panel-open-rows');

        var maxTags = rows.getAttribute('pr0n-max-tags');
        rows.setAttribute('pr0n-max-tags', parseInt(maxTags) + 6);

        this.prepareOpenPanel(doc, win);
    },

    refreshOpenPanel : function(doc, win) {
        this.buttonProgress(doc.getElementById('pr0n-share-refresh-button'), true, 'Refresh tags', null);

        var me = this;
        this.tagsRefresh(
            function() {
                me.prepareOpenPanel(doc, win);
                me.buttonProgress(doc.getElementById('pr0n-share-refresh-button'), false, 'Refresh tags', null);
            } );
    },

    checkboxClick : function(doc, win, obj) {
        var text = doc.getElementById('pr0n-open-tags');

        var tags = text.value.split(',');
        var tArray = [];
        for (var i=0; i<tags.length; i++) {
            var t = tags[i].trim();
            if (t != '')
                tArray.push(t);
        }

        var objStr = obj.label;
        var checked = !obj.checked;

        if (checked) {
            if (tArray.indexOf(objStr) == -1)
                tArray.push(objStr);
        } else {
            var n = [];

            for (var i=0; i<tArray.length; i++)
                if (tArray[i] != objStr)
                    n.push(tArray[i]);

            tArray =  n;
        }

        var str = '';
        for (var i=0; i<tArray.length; i++)
            str += (i != 0 ? ', ' : '') + tArray[i];
        text.value = str;
    },

    noResults : function(doc) {
        var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                             .getService().wrappedJSObject;
        pr0n.message('No results for these tags. Or maybe the server is down.');
        this.buttonProgress(doc.getElementById('Pr0n-Toolbar-ShareOpen'), false, null, 'chrome://pr0n/content/modules/share/images/open.png');
    },

    // Abuse function -------------------------------------------------------
    prepareAbusePanel : function(doc, win) {
        doc.getElementById('pr0n-share-abuse-groups').selectedIndex = 0;
        this.buttonProgress(doc.getElementById('pr0n-share-button-abuse'), false, 'Send', null);
    },

    abuse : function(doc, win) {
        this.buttonProgress(doc.getElementById('pr0n-share-button-abuse'), true, 'Send', null);

        var mainWindow = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIWebNavigation)
                         .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                         .rootTreeItem
                         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIDOMWindow);

        var url = mainWindow.getBrowser().currentURI.spec;
        if (url.substring(0, 7) != 'http://') {
            this.closeAbusePopup(doc);
            return;
        }

        var id = doc.getElementById('pr0n-share-abuse-groups').selectedIndex;
        if (id < 0 || id > this._abuseReasons.length)
            id = 0;

        var reason = this._abuseReasons[id].value;

        var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                            .createInstance(Components.interfaces.nsIXMLHttpRequest);
        req.open('POST', this.url() + '/remove', true);

        var me = this;
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                me.closeAbusePopup(doc);
            }
        }

        var obj = this.JSON().encode(
            { url     : url,
              reason  : reason }
        );

        req.send(obj);
    },

    closeAbusePopup : function(doc) {
        var evnt = { notify: function(timer) {  doc.getElementById("Pr0n-Panel-Share-Abuse").hidePopup(); } }
        var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
        timer.initWithCallback(evnt, 1000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    },

    // Share function -------------------------------------------------------
    prepareSharePanel : function(doc, win) {
        var mainWindow = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIWebNavigation)
                         .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                         .rootTreeItem
                         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIDOMWindow);

        doc.getElementById("pr0n-share-url").value  = mainWindow.getBrowser().currentURI.spec;
        doc.getElementById("pr0n-share-name").value = mainWindow.getBrowser().contentTitle;
        doc.getElementById("pr0n-share-tags").value = '';
        doc.getElementById("pr0n-share-tags").focus();

        this.buttonProgress(doc.getElementById('pr0n-share-button'), false, 'Share', null);
    },

    share : function(doc, win) {
        var tags = doc.getElementById('pr0n-share-tags').value.split(',');
        var tArray = [];
        for (var i=0; i<tags.length; i++) {
            var t = tags[i].trim();
            if (t != '')
                tArray.push(t);
        }

        var radiogroup = doc.getElementById('pr0n-share-main-tags');
        var mtagid = radiogroup.selectedIndex;
        if (mtagid >= 0 && mtagid < this._mainTags.length)
            tArray.push(this._mainTags[mtagid]);

        this.shareUrls(doc,
                       [ { url:   doc.getElementById('pr0n-share-url').value,
                           title: doc.getElementById('pr0n-share-name').value,
                           tags:  tArray } ]);
    },

    closeSharePopup : function(doc) {
        var evnt = { notify: function(timer) {  doc.getElementById("Pr0n-Panel-Share").hidePopup(); } }
        var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
        timer.initWithCallback(evnt, 1000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
    },

    shareUrls : function(doc, urls) {
        this.buttonProgress(doc.getElementById('pr0n-share-button'), true, 'Share', null);

        var validUrls = [];
        for(var i=0; i<urls.length; i++)
            if (urls[i].url.substring(0, 7) == 'http://')
                validUrls.push(urls[i]);

        if (validUrls.length == 0) {
            this.closeSharePopup(doc);
            return;
        }

        var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                            .createInstance(Components.interfaces.nsIXMLHttpRequest);
        req.open('POST', this.url(), true);

        var me = this;
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                me.closeSharePopup(doc);
            }
        }

        // Protocol 0.2:
        var obj = this.JSON().encode(
            { version : "0.2",
              urls    : validUrls }
        );

        req.send(obj);
    },

    // Tags refresh ----------------------------------------------------------
    tagsRefresh : function(func) {
        var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                            .createInstance(Components.interfaces.nsIXMLHttpRequest);
        req.open('GET', this.url() + '/tags', true);

        var me = this;
        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                try {
                    var obj = me.JSON().decode(req.responseText);
                    if (obj.success == true &&
                        obj.tags instanceof Array) {
                        me._config.tags = obj.tags;
                        me.save();
                    } else {
                        dump("Obj success == false\n");
                        var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                                             .getService().wrappedJSObject.serverError();
                    }

                } catch(e) {
                    dump(req.responseText + " - " + e + '\n');
                    var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                                         .getService().wrappedJSObject.serverError();
                }

                // Callback:
                if (func)
                    func();
            }
        }

        req.send(null);
    },

    showInfo : function(win, tags, rate) {
        var w = win.contentWindow.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
           .getInterface(Components.interfaces.nsIWebNavigation)
           .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
           .rootTreeItem
           .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
           .getInterface(Components.interfaces.nsIDOMWindow);

        var obj = w.document.getElementById("pr0n-share-tags-list");
        if (!obj)
            return;

        while(obj.firstChild)
           obj.removeChild(obj.firstChild);

        if (tags) {
            var sep = w.document.createElement('toolbarseparator');
            obj.appendChild(sep);

            var vbox = w.document.createElement('vbox');
            obj.appendChild(vbox);

            var spacer = w.document.createElement('label');
            spacer.setAttribute('flex', '1');
            vbox.appendChild(spacer);

            tags.sort();

            var box = w.document.createElement('hbox');
            vbox.appendChild(box);

            for (var i=0; i < tags.length; i++) {
                var label = w.document.createElement('label');
                label.setAttribute('value',   tags[i]);
                label.setAttribute('class',   'text-link');
                label.setAttribute('style',   'color: #fff');
                label.setAttribute('onclick', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                        '.getService().wrappedJSObject' +
                                                        '.module("share").open(document, window, this);');
                box.appendChild(label);
            }

            spacer = w.document.createElement('label');
            spacer.setAttribute('flex', '1');
            vbox.appendChild(spacer);
        }

        this.showRate(rate, w.document, w, true);
    },

    showRate: function(rate, doc, win, toStore) {
        var rateStr = "" + (rate ? rate : "");
        switch (rateStr.length) {
            case 0:  rateStr = '0.00'; break;
            case 1:  rateStr = rateStr + '.00'; break;
            case 2:  rateStr = rateStr + '.0'; break;
            case 3:  rateStr = rateStr + '0'; break;
            default: rateStr = rateStr.substring(0, 4); break;
        }

        var label = doc.getElementById('pr0n-share-rate');

        if (toStore == true)
            label.setAttribute('pr0nRate', rateStr);

        label.setAttribute('value', 'Rate: ' + rateStr);

        var id = parseInt(rate);
        var i=0;

        for (; i<id; i++) {
            var image = doc.getElementById('pr0n-share-rate-' + i);
            image.setAttribute('src', 'chrome://pr0n/content/modules/share/images/rating_selected.png');
        }

        for (; i<5; i++) {
            var image = doc.getElementById('pr0n-share-rate-' + i);
            image.setAttribute('src', 'chrome://pr0n/content/modules/share/images/rating_off.png');
        }
    },

    // Window functions ------------------------------------------------------
    windowNew : function(win) {
        var me = this;
        win.addEventListener('load', function() {
            win.removeEventListener("load", arguments.callee, true);
            me.windowOnLoad(win); }, true);

        try {
            this.windowOnLoad(win);
        } catch(e) {}
    },

    windowOnLoad : function(win) {
        var me = this;

        var win = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
           .getInterface(Components.interfaces.nsIWebNavigation)
           .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
           .rootTreeItem
           .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
           .getInterface(Components.interfaces.nsIDOMWindow);

        win.addEventListener("DOMContentLoaded", function(evnt) { me.windowDOMContentLoaded(evnt); }, true);

        if (win.gBrowser && win.gBrowser.browsers) {
            for (var i = 0; i < win.gBrowser.browsers.length; i++) {
                this.windowAddBrowser(win.gBrowser.browsers[i]);
            }

            var container = win.gBrowser.tabContainer;
            container.addEventListener("TabOpen", function(evnt) { me.windowTabAdded(win, evnt); }, false);
            container.addEventListener("TabClose", function(evnt) { me.windowTabRemoved(win, evnt); }, false);
        }
    },

    windowDOMContentLoaded : function(evnt) {
        var doc = evnt.originalTarget;
        try {
           if (doc.location.href.substring(0, 7) != 'http://')
               return;

           this.windowUpdate(evnt.currentTarget, doc, doc.location.href);
        } catch(e) { }
    },

    windowAddBrowser : function(browser) {
        var me = this;
        browser.addEventListener("focus", function(evnt) { me.windowFocus(browser, evnt); }, true);
        browser.addEventListener("blur",  function(evnt) { me.windowBlur(browser, evnt); }, true);
        this._windows.push({ win: browser, url: null, time: 0, tags: null });
    },

    windowFocus : function(win, evnt) {
        for(var i = 0; i<this._windows.length; i++) {
            if (this._windows[i].win == win) {
                this._windows[i].time = Date.now();
                this._currentWindow = win;
                this.showInfo(win, this._windows[i].tags, this._windows[i].rate);
            } else {
                this._windows[i].time = 0;
            }
        }
    },

    windowBlur : function(win, evnt) {
        for(var i = 0; i<this._windows.length; i++) {
            if (this._windows[i].win == win)
                this._windows[i].time = 0;
        }
    },

    windowTabAdded : function(win, evnt) {
        var browser = win.gBrowser.getBrowserForTab(evnt.target);
        this.windowAddBrowser(browser);
    },

    windowTabRemoved : function(win, evnt) {
        var browser = win.gBrowser.getBrowserForTab(evnt.target);

        var nWindows = [];
        for(var i = 0; i<this._windows.length; i++)
            if (this._windows[i].win != browser)
                nWindows.push(this._windows[i]);

        this._windows = nWindows;
    },

    windowUpdate : function(win, doc, url) {
        var browser = win.gBrowser.getBrowserForDocument(doc);
        for(var i = 0; i<this._windows.length; i++) {
            // If I find the same browser, I reset the timer if the url is !=
            if (this._windows[i].win == browser) {
                if (this._windows[i].url != url) {
                    this._windows[i].time = Date.now();
                    this._windows[i].url = url;

                    if (url != this._windows[i].newUrl) {
                        this._windows[i].newUrl = null;
                        this._windows[i].tags = null;
                        this._windows[i].rate = null;
                    }

                    this.showInfo(browser, this._windows[i].tags, this._windows[i].rate);
                }
                return;
            }
        }
    },

    windowTimer : function() {
        if (this._inPrivateBrowsing == false ||
            this.autoPBrowsing() == false)
            return;

        // When the user is watching something for more than 30secs, I send it:
        for(var i = 0; i<this._windows.length; i++) {
            if (this._windows[i].time != 0 &&
                Date.now() - this._windows[i].time > this._maxTimer &&
                this._windows[i].win.contentWindow) {
                var win = this._windows[i].win.contentWindow
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIWebNavigation)
                   .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                   .rootTreeItem
                   .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                   .getInterface(Components.interfaces.nsIDOMWindow);

                this._windows[i].time = 0;

                var panel = win.document.getElementById('Pr0n-Panel-Share');
                if (panel) {
                    panel = panel.wrappedJSObject;
                    panel.openPopup(win.document.getElementById("Pr0n-Toolbar-Share"),
                                    "after_start", 0, 0, false, false);

                    panel.setAttribute('pr0nToHide', 'true');
                    var evnt = { notify: function(timer) {
                        if (panel.getAttribute('pr0nToHide') == 'true')
                            panel.hidePopup(); } }

                    var timer = Components.classes["@mozilla.org/timer;1"]
                                               .createInstance(Components.interfaces.nsITimer);
                    timer.initWithCallback(evnt, 2000 /* 2 secs */,
                                           Components.interfaces.nsITimer.TYPE_ONE_SHOT);
                }
            }
        }
    },

    rateId : function(image) {
        var split = image.getAttribute('id').split('-');
        return parseInt(split[split.length - 1]);
    },

    rateOver : function(image, doc, win) {
        var id = this.rateId(image);
        for (var i=0 ; i<=id; i++) {
            var image = doc.getElementById('pr0n-share-rate-' + i);
            image.setAttribute('src', 'chrome://pr0n/content/modules/share/images/rating_highlighted.png');
        }

        var label = doc.getElementById('pr0n-share-rate');
        label.setAttribute('value', 'Rate: ' + (id + 1) + '.00');
    },

    rateOut : function(image, doc, win) {
        var label = doc.getElementById('pr0n-share-rate');
        this.showRate(label.getAttribute('pr0nRate'), doc, win, false);
    },

    rateClick : function(image, doc, win) {
        var me = this;
        var id = this.rateId(image) + 1;

        var label = doc.getElementById('pr0n-share-rate');
        var rateStr = label.getAttribute('value');
        label.setAttribute('value', 'Rating...');

        var mainWindow = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIWebNavigation)
                            .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                            .rootTreeItem
                            .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                            .getInterface(Components.interfaces.nsIDOMWindow);

        var url = mainWindow.getBrowser().currentURI.spec;
        if (url.substring(0, 7) != 'http://') {
            var evnt = { notify: function(timer) { me.rateOk(doc, win, rateStr); } }
            var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
            timer.initWithCallback(evnt, 1000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
            return;
        }

        var req = Components.classes["@mozilla.org/xmlextras/xmlhttprequest;1"]
                            .createInstance(Components.interfaces.nsIXMLHttpRequest);
        req.open('POST', this.url() + '/rate', true);

        req.onreadystatechange = function() {
            if (req.readyState == 4) {
                var evnt = { notify: function(timer) { me.rateOk(doc, win, rateStr); } }
                var timer = Components.classes["@mozilla.org/timer;1"].createInstance(Components.interfaces.nsITimer);
                timer.initWithCallback(evnt, 1000, Components.interfaces.nsITimer.TYPE_ONE_SHOT);
            }
        }

        var obj = this.JSON().encode(
            { url  : url,
              rate : id }
        );

        req.send(obj);
    },

    rateOk : function(doc, win, str) {
        var label = doc.getElementById('pr0n-share-rate');
        label.setAttribute('value', str);
    },

    // Observer ------------------------------------------------------------
    observe : function(aSubject, aTopic, aData) {
        switch(aTopic) {
            case 'domwindowopened':
                this.windowNew(aSubject);
                break;

            case 'timer-callback':
                this.windowTimer();
                break;

            case 'network:offline-status-changed':
                this._offline = (aData == 'offline' ? true : false);
                break;
        }
    }
};

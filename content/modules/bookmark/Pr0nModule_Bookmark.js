/* See license.txt for terms of usage */

var Pr0nModule_Bookmark = {
    _JSON   : null,
    _size   : 300,

    // Common functions ------------------------------------------------------
    getNode : function(doc) {
        var items=[];
        var item;

        // Bookmark button ------------------------------------------------------
        item = doc.createElement('toolbarbutton');
        item.setAttribute('id',          'Pr0n-Toolbar-Bookmark-Bookmark');
        item.setAttribute('class',       'pr0n-button-menu');
        item.setAttribute('type',        'menu');
        item.setAttribute('image',       'chrome://pr0n/content/modules/bookmark/images/icon.png');
        item.setAttribute('tooltiptext', 'Bookmark this page or browser bookmarked contents!');
        items.push(item);

        // Panel for bookmark
        var panel = doc.createElement('menupopup');
        panel.setAttribute('id',           'Pr0n-Panel-Bookmark-Bookmark');
        panel.setAttribute('noautofocus',  'true');
        panel.setAttribute('class',        'pr0n-panel');
        panel.setAttribute('position',     'after_start');
        panel.setAttribute('ignorekeys',   'true');
        panel.setAttribute('orient',       'vertical');
        panel.setAttribute('onpopupshown', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                     '.getService().wrappedJSObject' +
                                                     '.module("bookmark").prepareBookmarkPanel(document, window);');
        item.appendChild(panel);

        var menuitem;
        menuitem = doc.createElement('menuitem');
        menuitem.setAttribute('class',     'pr0n-panel-title pr0n-menu-item');
        menuitem.setAttribute('label',     'Bookmark this page');
        menuitem.setAttribute('oncommand', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                     '.getService().wrappedJSObject' +
                                                     '.module("bookmark").bookmarkPage(document, window);');
        panel.appendChild(menuitem);

        panel.appendChild(doc.createElement('menuseparator'));

        menuitem = doc.createElement('menuitem');
        menuitem.setAttribute('label',     'Manage your bookmark');
        menuitem.setAttribute('class',     'pr0n-menu-item');
        menuitem.setAttribute('oncommand', 'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                     '.getService().wrappedJSObject' +
                                                     '.module("bookmark").manage(document, window);');
        panel.appendChild(menuitem);

        panel.appendChild(doc.createElement('menuseparator'));

        // Buttons in the end of panel:
        var hbox;
        hbox = doc.createElement('hbox');
        hbox.setAttribute('pr0nbookmark', 'true');
        hbox.setAttribute('pack',         'end');
        panel.appendChild(hbox);

        button = doc.createElement('button');
        button.setAttribute('class',     'pr0n-button');
        button.setAttribute('label',     'Close');
        button.setAttribute('oncommand', 'document.getElementById("Pr0n-Panel-Bookmark-Bookmark").hidePopup();');
        hbox.appendChild(button);

        return items;
    },

    bookmarkFile : function() {
        var file = Components.classes["@mozilla.org/file/directory_service;1"]
                             .getService(Components.interfaces.nsIProperties)
                             .get("ProfD", Components.interfaces.nsIFile);

        file.append('Pr0nBookmark.json');
        if (!file.exists()) {
            file.create(Components.interfaces.nsIFile.NORMAL_FILE_TYPE, 0600);
            this.save([]);
        }

        return file;
    },

    save : function(obj) {
        // encoded in json:
        var data = this._JSON.encode(obj);

        // Save:
        var file = this.bookmarkFile();

        var outputStream = Components.classes["@mozilla.org/network/file-output-stream;1"]
                                     .createInstance(Components.interfaces.nsIFileOutputStream);
        var converter = Components.classes["@mozilla.org/intl/converter-output-stream;1"]
                                  .createInstance(Components.interfaces.nsIConverterOutputStream);
        outputStream.init(file, 0x02 | 0x08 | 0x20, 0600, 0);
        converter.init(outputStream, "UTF-8", 0, 0);

        var result = converter.writeString(data);
        outputStream.close();
    },

    init : function() {
        this._JSON = Components.classes['@mozilla.org/dom/json;1']
                               .createInstance(Components.interfaces.nsIJSON);

        // Read the file:
        var file = this.bookmarkFile();

        var fstream = Components.classes["@mozilla.org/network/file-input-stream;1"]
                                .createInstance(Components.interfaces.nsIFileInputStream);
        var cstream = Components.classes["@mozilla.org/intl/converter-input-stream;1"]
                                .createInstance(Components.interfaces.nsIConverterInputStream);
        fstream.init(file, -1, 0, 0);
        cstream.init(fstream, "UTF-8", 0, 0);

        var data = '';
        var str = {};
        try {
            while(cstream.readString(4096, str) != 0)
                data += str.value;
        } catch(e) { }
        cstream.close();

        var bookmarks = [];

        try {
            // Parsing the array of bytes:
            bookmarks = this._JSON.decode(data);
        } catch(e) {
            bookmarks = [];
        }

        Components.classes["@wepr0n.com/pr0n;1"]
                  .getService().wrappedJSObject._bookmarks = bookmarks;

        var lastId = 0;
        for(var i = 0; i< bookmarks.length; i++) {
            if (bookmarks[i].id > lastId)
                lastId = bookmarks[i].id;
        }

        Components.classes["@wepr0n.com/pr0n;1"]
                  .getService().wrappedJSObject._bookmarksLastId = lastId;
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

    bookmarkPage : function(doc, win) {
        var mainWindow = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIWebNavigation)
                         .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                         .rootTreeItem
                         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIDOMWindow);

        if (mainWindow.getBrowser().currentURI.spec.indexOf('http://') != 0 &&
            mainWindow.getBrowser().currentURI.spec.indexOf('https://') != 0)
            return;

        var d = new Date();

        Components.classes["@wepr0n.com/pr0n;1"]
                  .getService().wrappedJSObject._bookmarksLastId++;

        let bookmark = { url       : mainWindow.getBrowser().currentURI.spec,
                         title     : mainWindow.getBrowser().contentTitle,
                         timestamp : d.getTime(),
                         id        : Components.classes["@wepr0n.com/pr0n;1"]
                                               .getService().wrappedJSObject._bookmarksLastId };

        var bookmarks = Components.classes["@wepr0n.com/pr0n;1"]
                                  .getService().wrappedJSObject._bookmarks;

        for (var i=0; i<bookmarks.length; i++) {
            if (bookmarks[i].url == bookmark.url)
                return;
        }

        this.screenshot(doc, win, mainWindow.getBrowser().contentWindow, bookmark);
        this.bookmarkPageReal(doc, win, bookmark);
    },

    bookmarkPageReal : function(doc, win, bookmark) {
        Components.classes["@wepr0n.com/pr0n;1"]
                  .getService().wrappedJSObject._bookmarks.push(bookmark);

        this.save(Components.classes["@wepr0n.com/pr0n;1"]
                            .getService().wrappedJSObject._bookmarks);
        this.prepareBookmarkPanel(doc, win);
    },

    screenshot : function(doc, win, mainWindow, bookmark) {
        // Size:
        var width = mainWindow.innerWidth;
        var height = mainWindow.innerHeight;

        // Canvas:
        var canvas = mainWindow.document.createElementNS("http://www.w3.org/1999/xhtml", "html:canvas");
        canvas.style.width =  this._size + "px";
        canvas.style.height = this._size + "px";
        canvas.width =  this._size;
        canvas.height = this._size;

        var ctx = canvas.getContext("2d");
        ctx.globalAlpha = 1.0;

        ctx.clearRect(0, 0, this._size, this._size);
        ctx.save();

        var max = width > height ? width : height;
        ctx.scale(this._size / max, this._size / max);
        ctx.drawWindow(mainWindow, 0, 0, max, max, "rgba(0,0,0,0)");
        ctx.restore();

        // File:
        var file = Components.classes["@mozilla.org/file/directory_service;1"]
                             .getService(Components.interfaces.nsIProperties)
                             .get("ProfD", Components.interfaces.nsIFile);

        file.append('pr0nBookmarks');
        if (!file.exists())
            file.create(Components.interfaces.nsIFile.DIRECTORY_TYPE, 0777);
        file.append(bookmark.id + '.png');

        // Saving:
        var io = Components.classes["@mozilla.org/network/io-service;1"]
                           .getService(Components.interfaces.nsIIOService);
        var source = io.newURI(canvas.toDataURL("image/png", ""), "UTF8", null);

        var persist = Components.classes["@mozilla.org/embedding/browser/nsWebBrowserPersist;1"]
                                .createInstance(Components.interfaces.nsIWebBrowserPersist);

        persist.persistFlags = Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_REPLACE_EXISTING_FILES;
        persist.persistFlags |= Components.interfaces.nsIWebBrowserPersist.PERSIST_FLAGS_AUTODETECT_APPLY_CONVERSION;

        persist.saveURI(source, null, null, null, null, file);
    },

    prepareBookmarkPanel : function(doc, win) {
        var bookmarks = Components.classes["@wepr0n.com/pr0n;1"]
                                  .getService().wrappedJSObject._bookmarks;

        bookmarks.sort(function(a, b) {
            var aa = a.title ? a.title : a.url;
            var bb = b.title ? b.title : b.url;
            if (aa < bb) return -1;
            if (aa > bb) return 1;
            return 0;
        });

        menu = doc.getElementById('Pr0n-Panel-Bookmark-Bookmark');
        this.populateMenu(doc, win, menu, -1);
    },

    populateMenu : function(doc, win, menu, max, file) {
        for (var i = 0; i < menu.children.length;) {
           if (menu.children[i].getAttribute('pr0nbookmark'))
               menu.removeChild(menu.children[i]);
           else
               i++;
        }

        var bookmarks = Components.classes["@wepr0n.com/pr0n;1"]
                                  .getService().wrappedJSObject._bookmarks;

        for (var i = 0; i< bookmarks.length; i++) {
            if (max != -1 && i >= 10) break;

            var item = doc.createElement('menuitem');
            item.setAttribute('label', bookmarks[i].title ?
                                       bookmarks[i].title : bookmarks[i].url);
            item.setAttribute('pr0nUrl', bookmarks[i].url);
            item.setAttribute('class',        'pr0n-menu-item');
            item.setAttribute('pr0nbookmark', 'true');
            item.setAttribute('oncommand',    'Components.classes["@wepr0n.com/pr0n;1"]' +
                                                        '.getService().wrappedJSObject' +
                                                        '.module("bookmark").openPage(document, window, this);');

            menu.appendChild(item);
        }

        // Buttons in the end of panel:
        var hbox;
        hbox = doc.createElement('hbox');
        hbox.setAttribute('pr0nbookmark', 'true');
        hbox.setAttribute('pack',         'end');
        menu.appendChild(hbox);

        button = doc.createElement('button');
        button.setAttribute('class',     'pr0n-button');
        button.setAttribute('label',     'Close');
        button.setAttribute('oncommand', 'document.getElementById("Pr0n-Panel-Bookmark-Bookmark").hidePopup();');
        hbox.appendChild(button);

    },

    openPage : function(doc, win, item) {
        var mainWindow = win.QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIWebNavigation)
                         .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                         .rootTreeItem
                         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIDOMWindow);

        mainWindow.getBrowser().loadURI(item.getAttribute('pr0nUrl'));
    },

    getRecent : function() {
        var bookmarks = Components.classes["@wepr0n.com/pr0n;1"]
                                  .getService().wrappedJSObject._bookmarks;

        bookmarks.sort(function(a, b) {
            return b.timestamp - a.timestamp;
        });

        var ret = [];
        for (var i = 0; i< bookmarks.length; i++) {
            var a = bookmarks[i];

            var file = Components.classes["@mozilla.org/file/directory_service;1"]
                                 .getService(Components.interfaces.nsIProperties)
                                 .get("ProfD", Components.interfaces.nsIFile);

            file.append('pr0nBookmarks');
            file.append(a.id + '.png');
            if (!file.exists())
                continue;

            var ioService = Components.classes["@mozilla.org/network/io-service;1"]
                                      .getService(Components.interfaces.nsIIOService);

            uri = ioService.newFileURI(file);
            a.image = uri.spec;
            ret.push(a);
        }

        return ret;
    },

    getAll : function() {
        var bookmarks = Components.classes["@wepr0n.com/pr0n;1"]
                                  .getService().wrappedJSObject._bookmarks;

        bookmarks.sort(function(a, b) {
            var aa = a.title ? a.title : a.url;
            var bb = b.title ? b.title : b.url;
            if (aa < bb) return -1;
            if (aa > bb) return 1;
            return 0;
        });

        return bookmarks;
    },

    deleteBookmark : function(bookmark) {
        var bookmarks = Components.classes["@wepr0n.com/pr0n;1"]
                                  .getService().wrappedJSObject._bookmarks;

        var save = false;

        for (var i=0; i<bookmarks.length; i++) {
            if (bookmarks[i].url == bookmark) {
                var file = Components.classes["@mozilla.org/file/directory_service;1"]
                                     .getService(Components.interfaces.nsIProperties)
                                     .get("ProfD", Components.interfaces.nsIFile);

                file.append('pr0nBookmarks');
                file.append(bookmarks[i].id + '.png');

                if (file.exists())
                    file.remove(true);

                bookmarks.splice(i, 1);
                save = true;
                break;
            }
        }

        if (save == false) return;

        Components.classes["@wepr0n.com/pr0n;1"]
                  .getService().wrappedJSObject._bookmarks = bookmarks;
        this.save(bookmarks);
    },

    manage : function(doc, win) {
        win.openDialog('chrome://pr0n/content/modules/bookmark/manage.xul', 'Pr0n Bookman Manager', 'chrome,dialog,centerscreen', win);
    }
};

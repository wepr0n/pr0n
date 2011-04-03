function Pr0nBookmarksLoad() {
    var treebox = document.getElementById("Pr0n-bookmarks-list-children");

    for (var i=0; treebox.childNodes[i];) {
        if (treebox.childNodes[i].nodeName != "treeitem")
            i++;
        else
            treebox.removeChild(treebox.childNodes[i]);
    }

    var module = Components.classes["@wepr0n.com/pr0n;1"]
                           .getService().wrappedJSObject
                           .module("bookmark");
    if (module != 0) {
        var bookmarks = module.getAll();

        for (var i=0; bookmarks[i]; i++) {
            var item = document.createElement("treeitem");
            item.setAttribute("bookmarkId", i);
            treebox.appendChild(item);

            var row = document.createElement("treerow");
            item.appendChild(row);

            var cell = null;

            cell = document.createElement("treecell");
            cell.setAttribute("label", bookmarks[i].title);
            row.appendChild(cell);

            cell = document.createElement("treecell");
            cell.setAttribute("label", bookmarks[i].url);
            row.appendChild(cell);
        }
    }
}

function Pr0nBookmarksOpen() {
    var tree = document.getElementById('Pr0n-Bookmarks-list');
    if (tree.currentIndex == -1)
        return;

    var module = Components.classes["@wepr0n.com/pr0n;1"]
                           .getService().wrappedJSObject
                           .module("bookmark");
    if (!module) return;

    var bookmarks = module.getAll();
    var bookmark = bookmarks[tree.currentIndex]
    if (!bookmark) return;

    if (window.arguments) {
        var mainWindow = window.arguments[0]
                         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIWebNavigation)
                         .QueryInterface(Components.interfaces.nsIDocShellTreeItem)
                         .rootTreeItem
                         .QueryInterface(Components.interfaces.nsIInterfaceRequestor)
                         .getInterface(Components.interfaces.nsIDOMWindow);

        mainWindow.getBrowser().loadURI(bookmark.url);
    }

    window.close();
}

function Pr0nBookmarksDelete() {
    var tree = document.getElementById('Pr0n-Bookmarks-list');
    if (tree.currentIndex == -1)
        return;

    var module = Components.classes["@wepr0n.com/pr0n;1"]
                           .getService().wrappedJSObject
                           .module("bookmark");
    if (!module) return;

    var bookmarks = module.getAll();
    var bookmark = bookmarks[tree.currentIndex]
    if (!bookmark) return;

    module.deleteBookmark(bookmark.url);

    Pr0nBookmarksLoad();
}

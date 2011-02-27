function Pr0nTutorialLoad() {
    var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                         .getService().wrappedJSObject;

    document.getElementById("pr0n-normal-browsing-enabled").checked = !pr0n._config.toolbarInNormalBrowsing;

    var image;

    image = document.getElementById('pr0n-tutorial-toolbar');
    image.src='chrome://pr0n/content/images/tutorial/toolbar_linux.png';
}

function pr0nShownNormalBrowsingMode() {
    var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                         .getService().wrappedJSObject;

    pr0n._config.toolbarInNormalBrowsing = document.getElementById("pr0n-normal-browsing-enabled").checked;

    pr0n.save();
}

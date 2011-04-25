var Pr0nHome = {

load : function() {
    var module = Components.classes["@wepr0n.com/pr0n;1"]
                           .getService().wrappedJSObject
                           .module("bookmark");
    if (module != 0)
        this.showRecent(module.getRecent());
},

showRecent : function(bookmarks) {
    var img = document.getElementById('images');

    var div = null
    for(var i=0; i<bookmarks.length; i++) {
        if (div == null || !(i % 4)) {
            div = document.createElement('div');
            img.appendChild(div)
        }

        var a = document.createElement('a');
        a.setAttribute('title', bookmarks[i].title);
        a.setAttribute('href',  bookmarks[i].url);
        div.appendChild(a);

        var aa = document.createElement('img');
        aa.setAttribute('class', 'Pr0nImage');
        aa.setAttribute('src', bookmarks[i].image);
        a.appendChild(aa);
    }
}

};

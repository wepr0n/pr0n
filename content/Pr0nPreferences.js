/* See license.txt for terms of usage */

function Pr0n_preferenceSave() {
    var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                         .getService().wrappedJSObject;

    var modules = pr0n.getModules();
    var extra = {};

    for(var i=0; i<modules.length; i++) {
        var oo = modules[i].obj.savePreference(document);
        if (oo == null)
            return false;

        extra[modules[i].name] = oo;
    }

    // Params for modules:
    pr0n._config.modulesParams = extra;

    // Private/Normal Browsing:
    pr0n._config.toolbarInNormalBrowsing = document.getElementById("pr0n-normal-browsing-enabled").checked;

    // List of modules:
    pr0n._config.modules = [];
    for(var i=0; i<modules.length; i++) {
        if(document.getElementById("pr0n-opt-modules-" + i).checked) {
            pr0n._config.modules.push(modules[i].name);
            modules[i].enabled = true;
            modules[i].obj.init();
        } else
            modules[i].enabled = false;
            modules[i].obj.shutdown();
    }

    // Saving:
    pr0n.save();
    return true;
}

function Pr0n_preferenceUpdate() {
    var pr0n = Components.classes["@wepr0n.com/pr0n;1"]
                       .getService().wrappedJSObject;

    // Private/Normal Browsing:
    document.getElementById("pr0n-normal-browsing-enabled").setAttribute("checked", pr0n._config.toolbarInNormalBrowsing);

    // List of modules:
    var modules = document.getElementById("pr0n-preference-modules-list");
    while(modules.firstChild)
       modules.removeChild(modules.firstChild);

    var m = pr0n.getModules();
    for(var i=0; i<m.length; i++) {
        var row = document.createElement('row');
        row.setAttribute('align', 'center');
        modules.appendChild(row);

        var image = document.createElement('image');
        image.setAttribute('src', m[i].icon);
        row.appendChild(image);

        var vbox = document.createElement('vbox');
        vbox.setAttribute('align', 'left');
        row.appendChild(vbox);

        var label = document.createElement('label');
        label.setAttribute('value',  m[i].name);
        label.setAttribute('style',  'font-weight: bold');
        label.setAttribute('control', 'pr0n-opt-modules-' + i);
        vbox.appendChild(label);

        label = document.createElement('label');
        label.setAttribute('value',  m[i].description);
        label.setAttribute('control', 'pr0n-opt-modules-' + i);
        vbox.appendChild(label);

        var hbox = document.createElement('hbox');
        hbox.setAttribute('align', 'center');
        row.appendChild(hbox);

        var checkbox = document.createElement('checkbox');
        checkbox.setAttribute('id', 'pr0n-opt-modules-' + i);
        checkbox.setAttribute('label', 'enabled');
        checkbox.setAttribute('checked', m[i].enabled == true ? 'true' : 'false');
        hbox.appendChild(checkbox);
    }

    var tab = document.getElementById("pr0n-preference-tab");
    for (var i=0; i<tab.children.length; i++) {
        if (tab.children[i] instanceof XULElement)  {
            if (tab.children[i].getAttribute('id') != 'pr0n-preference-general-label')
                tab.removeChild(tab.children[i]);
        }
    }

    var panel = document.getElementById("pr0n-preference-panel");
    for (var i=0; i<panel.children.length; i++) {
        if (panel.children[i] instanceof XULElement)  {
            if (panel.children[i].getAttribute('id') != 'pr0n-preference-general-panel')
                panel.removeChild(panel.children[i]);
        }
    }

    // Pages for the modules...
    for(var i=0; i<m.length; i++) {
        var obj = m[i].obj.getPreferenceNode(document);
        if (!obj)
            continue;

        var label = document.createElement('tab');
        label.setAttribute('label', obj.name);
        tab.appendChild(label);

        var p = document.createElement('tabpanel');
        p.setAttribute('flex', '1');
        panel.appendChild(p);

        var vbox = document.createElement('vbox');
        vbox.setAttribute('flex', '1');
        p.appendChild(vbox);

        for(var j=0; j<obj.items.length; j++)
            vbox.appendChild(obj.items[j]);
    }
}

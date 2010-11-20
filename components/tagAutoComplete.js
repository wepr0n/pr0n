Components.utils.import("resource://gre/modules/XPCOMUtils.jsm");

// Implements nsIAutoCompleteResult
function Pr0nTagsAutoCompleteResult(searchString, searchResult,
                                    defaultIndex, errorDescription,
                                    results, comments) {
  this._searchString = searchString;
  this._searchResult = searchResult;
  this._defaultIndex = defaultIndex;
  this._errorDescription = errorDescription;
  this._results = results;
  this._comments = comments;
}

Pr0nTagsAutoCompleteResult.prototype = {
  /**
   * The original search string
   */
  get searchString() {
    return this._searchString;
  },

  /**
   * The result code of this result object, either:
   *         RESULT_IGNORED   (invalid searchString)
   *         RESULT_FAILURE   (failure)
   *         RESULT_NOMATCH   (no matches found)
   *         RESULT_SUCCESS   (matches found)
   */
  get searchResult() {
    return this._searchResult;
  },

  /**
   * Index of the default item that should be entered if none is selected
   */
  get defaultIndex() {
    return this._defaultIndex;
  },

  /**
   * A string describing the cause of a search failure
   */
  get errorDescription() {
    return this._errorDescription;
  },

  /**
   * The number of matches
   */
  get matchCount() {
    return this._results.length;
  },

  /**
   * Get the value of the result at the given index
   */
  getValueAt: function PTACR_getValueAt(index) {
    return this._results[index];
  },

  /**
   * Get the comment of the result at the given index
   */
  getCommentAt: function PTACR_getCommentAt(index) {
    return this._comments[index];
  },

  /**
   * Get the style hint for the result at the given index
   */
  getStyleAt: function PTACR_getStyleAt(index) {
    if (!this._comments[index])
      return null;  // not a category label, so no special styling

    if (index == 0)
      return "suggestfirst";  // category label on first line of results
    return "suggesthint";   // category label on any other line of results
  },

  /**
   * Get the image for the result at the given index
   */
  getImageAt: function PTACR_getImageAt(index) {
    return null;
  },

  /**
   * Remove the value at the given index from the autocomplete results.
   * If removeFromDb is set to true, the value should be removed from
   * persistent storage as well.
   */
  removeValueAt: function PTACR_removeValueAt(index, removeFromDb) {
    this._results.splice(index, 1);
    this._comments.splice(index, 1);
  },

  QueryInterface: function(aIID) {
    if (!aIID.equals(Components.interfaces.nsIAutoCompleteResult) &&
        !aIID.equals(Components.interfaces.nsISupports))
        throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  }
};


// Implements nsIAutoCompleteSearch
function Pr0nTagsAutoCompleteSearch() {
}

Pr0nTagsAutoCompleteSearch.prototype = {
  classDescription: "Pr0n Tags AutoComplete",
  classID:          Components.ID("e6dbb66f-5d17-4135-a991-1e73bd01802d"),
  contractID:       "@mozilla.org/autocomplete/search;1?name=pr0n-tags-autocomplete",
  QueryInterface:   XPCOMUtils.generateQI([Components.interfaces.nsIAutoCompleteSearch]),

  /*
   * Search for a given string and notify a listener (either synchronously
   * or asynchronously) of the result
   *
   * @param searchString - The string to search for
   * @param searchParam - An extra parameter
   * @param previousResult - A previous result to use for faster searchinig
   * @param listener - A listener to notify when the search is complete
   */
  startSearch: function(searchString, searchParam, result, listener) {
    var results = [];
    var comments = [];
    var searchResults = [];

    try {
        var nativeJSON = Components.classes["@mozilla.org/dom/json;1"].createInstance(Components.interfaces.nsIJSON);
        searchResults = nativeJSON.decode(searchParam);
    } catch(e) {}

    // only search on characters for the last tag
    var index = Math.max(searchString.lastIndexOf(","), searchString.lastIndexOf(";"));
    var before = '';
    if (index != -1) {
        before = searchString.slice(0, index+1);
        searchString = searchString.slice(index+1);
        // skip past whitespace
        var m = searchString.match(/\s+/);
        if (m) {
           before += m[0];
           searchString = searchString.slice(m[0].length);
        }
    }

    if (!searchString.length) {
        var newResult = new Pr0nTagsAutoCompleteResult(searchString, Components.interfaces.nsIAutoCompleteResult.RESULT_NOMATCH, 0, "", results, comments);
        listener.onSearchResult(this, newResult);
        return;
    }

    for (var i =0;i < searchResults.length; i++) {
        // for each match, prepend what the user has typed so far
        if (searchResults[i].toLowerCase().indexOf(searchString.toLowerCase()) == 0 &&
            comments.indexOf(searchResults[i]) == -1) {
           results.push(before + searchResults[i]);
           comments.push(searchResults[i]);
        }
    }

    var newResult = new Pr0nTagsAutoCompleteResult(searchString, Components.interfaces.nsIAutoCompleteResult.RESULT_SUCCESS, 0, "", results, comments);
    listener.onSearchResult(this, newResult);
  },

  /*
   * Stop an asynchronous search that is in progress
   */
  stopSearch: function() {
  },
    
  QueryInterface: function(aIID) {
    if (!aIID.equals(Components.interfaces.nsIAutoCompleteSearch) &&
        !aIID.equals(Components.interfaces.nsISupports))
        throw Components.results.NS_ERROR_NO_INTERFACE;
    return this;
  }
};

// Factory
var Pr0nTagsAutoCompleteSearchFactory = {
  singleton: null,
  createInstance: function (aOuter, aIID) {
    if (aOuter != null)
      throw Components.results.NS_ERROR_NO_AGGREGATION;
    if (this.singleton == null)
      this.singleton = new Pr0nTagsAutoCompleteSearch();
    return this.singleton.QueryInterface(aIID);
  }
};

// Module initialization
var components = [Pr0nTagsAutoCompleteSearch];

/**
* XPCOMUtils.generateNSGetFactory was introduced in Mozilla 2 (Firefox 4).
* XPCOMUtils.generateNSGetModule is for Mozilla 1.9.2 (Firefox 3.6).
*/
if (XPCOMUtils.generateNSGetFactory)
  var NSGetFactory = XPCOMUtils.generateNSGetFactory(components);
else
  var NSGetModule = XPCOMUtils.generateNSGetModule(components);

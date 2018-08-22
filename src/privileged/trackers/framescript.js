/* global XPCOMUtils, sendAsyncMessage, docShell */
const {classes: Cc, interfaces: Ci} = Components;
const trackerListener = {
  QueryInterface: ChromeUtils.generateQI(["nsIWebProgressListener", "nsISupportsWeakReference"]),
  onSecurityChange: function(webProgress, request, state) {
    // This information should only be stored on the top-level docshell, so we use that even in frames.
    if (docShell.document.numTrackersFound > 0) {
      sendAsyncMessage("trackerStatus", {
        trackersFound: docShell.document.numTrackersFound,
        trackersBlocked: docShell.document.numTrackersBlocked,
      });
    }
  },
};

const filter = Cc["@mozilla.org/appshell/component/browser-status-filter;1"].createInstance(Ci.nsIWebProgress);
filter.addProgressListener(trackerListener, Ci.nsIWebProgress.NOTIFY_ALL);
const webProgress = docShell.QueryInterface(Ci.nsIInterfaceRequestor).getInterface(Ci.nsIWebProgress);
webProgress.addProgressListener(filter, Ci.nsIWebProgress.NOTIFY_ALL);

// Listen for errors from the content.
addEventListener("error", function(e) {
  sendAsyncMessage("pageError", e.error.name);
});

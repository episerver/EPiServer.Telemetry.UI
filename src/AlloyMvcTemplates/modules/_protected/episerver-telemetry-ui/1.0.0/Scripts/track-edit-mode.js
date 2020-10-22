define([
    "dojo/topic",
    "dojo/when",
    "epi/dependency",
    "epi-cms/contentediting/ContentViewModel",
    "epi-cms/contentediting/PageDataController",
    "episerver-telemetry-ui/idle-timer",
    "episerver-telemetry-ui/tracker"
], function (
    topic,
    when,
    dependency,
    ContentViewModel,
    PageDataController,
    idleTimer,
    tracker
) {
    return function () {
        var viewName = "";

        var heartbeatInterval = 60;
        var heartbeatTimeoutId;

        function trackHeartbeat(commandType) {
            if (idleTimer.isActive() && viewName) {
                tracker.trackEvent("edit_time", {
                    editMode: viewName,
                    commandType: commandType || "heartbeat"
                });
            }

            clearTimeout(heartbeatTimeoutId);
            heartbeatTimeoutId = setTimeout(trackHeartbeat, heartbeatInterval * 1000);
        }

        function trackContentSaved(model) {
            var isPage = model.contentData.capabilities.isPage;
            var isBlock = model.contentData.capabilities.isBlock;
            var contentType = isPage ? "page" : isBlock ? "block" : "";

            tracker.trackEvent("edit_contentSaved", {
                editMode: viewName,
                contentType: contentType
            });
        }

        function bindIframeEvents() {
            try {
                idleTimer.bindEvents(window["sitePreview"].document);
            } catch (e) {
                // catch error in x-domain scenario
            }
        }

        function patchPageDataController() {
            var originalIFrameLoaded = PageDataController.prototype._iFrameLoaded;
            PageDataController.prototype._iFrameLoaded = function () {
                originalIFrameLoaded.apply(this, arguments);
                bindIframeEvents();
            };
            PageDataController.prototype._iFrameLoaded.nom = "_iFrameLoaded";
        }

        function patchContentViewModel() {
            var originalSave = ContentViewModel.prototype._save;
            ContentViewModel.prototype._save = function (result) {
                trackContentSaved(this);
                return originalSave.apply(this, arguments);
            };
            ContentViewModel.prototype._save.nom = "_save";
        }

        function onViewChanged(type, args, data) {
            viewName = data.viewName || "";
        }

        function onEditModeChanged(data) {
            viewName = data.viewName || "";
            trackHeartbeat("changeView");
        }

        patchContentViewModel();

        // Triggered when changing view component, including Editing/Preview/Compare/ProjectView/ApprovalConfig, etc.
        // However it's not triggered by editMode switchButton.
        // Listen to this event for updating viewName.
        topic.subscribe("/epi/shell/action/viewchanged", onViewChanged);

        // Triggered when changing editMode. Listen to this event for tracking APE/OPE.
        topic.subscribe("/epi/shell/action/changeview/updatestate", onEditModeChanged);

        // The iframe exists, implies that view has been created. In this case, set viewName and start tracking.
        if (window["sitePreview"]) {
            var profile = dependency.resolve("epi.shell.Profile");
            when(profile.get("_savedView")).then(function (savedView) {
                if (savedView) {
                    viewName = savedView;
                }
                trackHeartbeat("loadPage");
            });
        }

        // Bind events on OPE iframe
        bindIframeEvents();
        patchPageDataController();
    };
});

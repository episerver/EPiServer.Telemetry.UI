define([
    "epi-cms/contentediting/viewmodel/CreateContentViewModel",
    "epi-cms/command/NewContent",
    "epi-cms/widget/command/CreateContentFromSelector",
    "episerver-telemetry-ui/tracker"
], function (
    CreateContentViewModel,
    NewContentCommand,
    CreateContentFromSelectorCommand,
    tracker
) {
    var entry = {};

    function trackContentCreated(isSuccess) {
        // For contentArea entry, this.requestedType is null.
        var isPage = (this.requestedType || entry.creatingTypeIdentifier) === "episerver.core.pagedata";
        var isBlock = (this.requestedType || entry.creatingTypeIdentifier) === "episerver.core.blockdata";
        if (!isPage && !isBlock) {
            return;
        }

        tracker.trackEvent("edit_contentCreated", {
            contentType: isPage ? "page" : "block",
            entryPoint: entry.entryPoint,
            isLocalAsset: this.createAsLocalAsset,
            isSuccess: isSuccess
        });
    }

    function trackOpenCreate() {
        var isPage = (this.contentType || entry.creatingTypeIdentifier) === "episerver.core.pagedata";
        var isBlock = (this.contentType || entry.creatingTypeIdentifier) === "episerver.core.blockdata";
        if (!isPage && !isBlock) {
            return;
        }
        tracker.trackEvent("edit_openCreateContent", {
            contentType: isPage ? "page" : "block",
            entryPoint: entry.entryPoint
        });
    }

    // Add tracker for creation
    function patchCreateContentViewModel() {
        // _saveSuccessHandler
        var originalSaveSuccessHandler = CreateContentViewModel.prototype._saveSuccessHandler;
        CreateContentViewModel.prototype._saveSuccessHandler = function () {
            trackContentCreated.call(this, true);
            originalSaveSuccessHandler.apply(this, arguments);
        };
        CreateContentViewModel.prototype._saveSuccessHandler.nom = "_saveSuccessHandler";

        // _saveErrorHandler
        var originalSaveErrorHandler = CreateContentViewModel.prototype._saveErrorHandler;
        CreateContentViewModel.prototype._saveErrorHandler = function () {
            trackContentCreated.call(this, false);
            originalSaveErrorHandler.apply(this, arguments);
        };
        CreateContentViewModel.prototype._saveErrorHandler.nom = "_saveErrorHandler";
    }

    // Set entry: side-pane
    function patchNewContentCommand() {
        // _execute
        var originalExecute = NewContentCommand.prototype._execute;
        NewContentCommand.prototype._execute = function () {
            entry.entryPoint = this.category === "context" ? "contentMenu" : "gadgetIcon";
            trackOpenCreate.call(this);
            originalExecute.apply(this, arguments);
        };
        NewContentCommand.prototype._execute.nom = "_execute";
    }

    // Set entry: Toolbar, ContentArea
    function patchCreateContentFromSelectorCommand() {
        // _execute
        var originalExecute = CreateContentFromSelectorCommand.prototype._execute;
        CreateContentFromSelectorCommand.prototype._execute = function () {
            if (this.settings && this.settings.model) {
                // Toolbar
                entry.entryPoint = "toolbar";
                entry.creatingTypeIdentifier = this.creatingTypeIdentifier;
            } else if (this.creatingTypeIdentifier) {
                // ContentArea
                entry.entryPoint = "contentArea";
                entry.creatingTypeIdentifier = this.creatingTypeIdentifier;
            }
            trackOpenCreate.call(this);
            originalExecute.apply(this, arguments);
        };
        CreateContentFromSelectorCommand.prototype._execute.nom = "_execute";
    }

    return function () {
        patchCreateContentViewModel();
        patchCreateContentFromSelectorCommand();
        patchNewContentCommand();
    };
});

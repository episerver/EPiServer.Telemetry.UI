define([
    "epi/shell/TypeDescriptorManager",
    "epi-cms/contentediting/command/BlockEdit",
    "epi-cms/asset/command/ChangeContextToSelection",
    "episerver-telemetry-ui/tracker"
], function (
    TypeDescriptorManager,
    BlockEditCommand,
    ChangeContextToSelectionCommand,
    tracker
) {
    var isDialogOpen = false;

    function patchBlockInlineEditCommand() {
        require(["epi-cms/contentediting/command/BlockInlineEdit"], function (BlockInlineEditCommand) {
            // _execute
            var original_Execute = BlockInlineEditCommand.prototype._execute;
            BlockInlineEditCommand.prototype._execute = function () {

                original_Execute.apply(this, arguments);

                if (this._dialog) {
                    isDialogOpen = true;
                    this._dialog.on("hide", function () {
                        isDialogOpen = false;
                    });
                }
            };
            BlockInlineEditCommand.prototype._execute.nom = "_execute";

            // execute
            var originalExecute = BlockInlineEditCommand.prototype.execute;
            BlockInlineEditCommand.prototype.execute = function (event) {

                originalExecute && originalExecute.apply(this, arguments);

                if (this.isAvailable && this.canExecute) {
                    var entryPoint = this.category === "context" ? "contextMenu" : "contentArea";
                    tracker.trackEvent("edit_openQuickEdit", {
                        entryPoint: entryPoint
                    });
                }
            };
            BlockInlineEditCommand.prototype.execute.nom = "execute";
        });
    }

    function getContentType(capabilities) {
        // Calc content type from capabilities.
        // Returns "page", "block" or an empty string for other types.

        var isPage = capabilities && capabilities.isPage;
        var isBlock = capabilities && capabilities.isBlock;
        var contentType = isPage ? "page" : isBlock ? "block" : "";

        return contentType;
    }

    function getContentTypeFromTypeIdentifier(typeIdentifier) {
        // Calc content type based on TypeIdentifier.
        // Returns "page", "block" or an empty string for other types.
        var contentType = "";
        if (TypeDescriptorManager.isBaseTypeIdentifier(typeIdentifier, "episerver.core.blockdata")) {
            contentType = "block";
        } else if (TypeDescriptorManager.isBaseTypeIdentifier(typeIdentifier, "episerver.core.pagedata")) {
            contentType = "page";
        }

        return contentType;
    }

    function patchBlockEditCommand() {
        // _execute
        var original_Execute = BlockEditCommand.prototype._execute;
        BlockEditCommand.prototype._execute = function () {

            original_Execute.apply(this, arguments);

            tracker.trackEvent("edit_openClassicEdit", {
                entryPoint: this.category === "context" ? "contextMenu" : "contentArea",
                contentType: getContentTypeFromTypeIdentifier(this.model.typeIdentifier)
            });
        };
        BlockEditCommand.prototype._execute.nom = "_execute";
    }

    function patchChangeContextToSelectionCommand() {
        // _execute
        var original_Execute = ChangeContextToSelectionCommand.prototype._execute;
        ChangeContextToSelectionCommand.prototype._execute = function () {

            original_Execute.apply(this, arguments);

            var target = this._getSingleSelectionData();
            tracker.trackEvent("edit_openClassicEdit", {
                entryPoint: this.category === "context" ? "contextMenu" : "contentArea",
                contentType: getContentType(target.capabilities)
            });
        };
        ChangeContextToSelectionCommand.prototype._execute.nom = "_execute";
    }

    return {
        initialize: function () {
            patchBlockInlineEditCommand();
            patchBlockEditCommand();
            patchChangeContextToSelectionCommand();
        },

        isQuickEdit: function () {
            return isDialogOpen;
        }
    };
});

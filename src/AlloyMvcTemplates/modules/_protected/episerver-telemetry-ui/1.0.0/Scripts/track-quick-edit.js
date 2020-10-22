define([
    "epi-cms/contentediting/command/BlockInlineEdit",
    "epi-cms/contentediting/command/BlockEdit",
    "episerver-telemetry-ui/tracker"
], function (
    BlockInlineEditCommand,
    BlockEditCommand,
    tracker
) {
    var isDialogOpen = false;

    function patchBlockInlineEditCommand() {
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
                var entryPoint = event && event.type === "click" ? "click" : "doubleClick";
                tracker.trackEvent("edit_openQuickEdit", {
                    entryPoint: entryPoint
                });
            }
        };
        BlockInlineEditCommand.prototype.execute.nom = "execute";
    }

    function patchBlockEditCommand() {
        // _execute
        var original_Execute = BlockEditCommand.prototype._execute;
        BlockEditCommand.prototype._execute = function () {

            original_Execute.apply(this, arguments);

            var isPage = this.model.content.capabilities.isPage;
            var isBlock = this.model.content.capabilities.isBlock;
            var contentType = isPage ? "page" : isBlock ? "block" : "";
            tracker.trackEvent("edit_openClassicEdit", {
                contentType: contentType
            });
        };
        BlockEditCommand.prototype._execute.nom = "_execute";
    }

    return {
        initialize: function () {
            patchBlockInlineEditCommand();
            patchBlockEditCommand();
        },

        isQuickEdit: function () {
            return isDialogOpen;
        }
    };
});

define([
    "epi-cms/contentediting/command/BlockInlineEdit",
    "episerver-telemetry-ui/tracker"
], function (
    BlockInlineEditCommand,
    tracker
) {
    var isDialogOpen = false;

    function patchBlockInlineEditCommand() {
        // _execute
        var originalExecute = BlockInlineEditCommand.prototype._execute;
        BlockInlineEditCommand.prototype._execute = function () {

            originalExecute.apply(this, arguments);

            if (this._dialog) {
                isDialogOpen = true;
                this._dialog.on("hide", function () {
                    isDialogOpen = false;
                });
            }
        };
        BlockInlineEditCommand.prototype._execute.nom = "_execute";
    }

    return {

        initialize: function () {
            patchBlockInlineEditCommand();
        },

        isQuickEdit: function () {
            return isDialogOpen;
        }
    };
});

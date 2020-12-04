define([
    "dojo/when",
    "episerver-telemetry-ui/tracker",
    "episerver-telemetry-ui/track-projects"
], function (
    when,
    tracker,
    trackProjects
) {

    function trackInlineMainButtonCommand(trackEventName, commandType, isSuccess) {
        trackProjects.getProjectState().then(function (isProjectSelected) {
            tracker.trackEvent(trackEventName, {
                commandType: commandType,
                isSuccess: isSuccess,
                isProjectSelected: isProjectSelected
            });
        });
    }

    function patchCommand(command, eventName) {
        var original_Execute = command.prototype._execute;
        command.prototype._execute = function (event) {
            var result = original_Execute.apply(this, arguments);
            when(result).then(function (executeResult) {
                trackInlineMainButtonCommand(eventName, this.commandType, !!executeResult);
            }.bind(this)).otherwise(function () {
                trackInlineMainButtonCommand(eventName, this.commandType, false);
            }.bind(this));
            return result;
        };
        command.prototype._execute.nom = "_execute";
    }

    function patchInlineCommands() {
        require([
            "epi-cms/contentediting/command/BlockInlineReadyForReview",
            "epi-cms/contentediting/command/BlockInlineReadyToPublish"
        ], function (
            BlockInlineReadyForReviewCommand,
            BlockInlineReadyToPublishCommand
        ) {
            patchCommand(BlockInlineReadyForReviewCommand, "edit_readyForReview");
            patchCommand(BlockInlineReadyToPublishCommand, "edit_readyToPublish");
        });
    }

    return {
        initialize: function () {
            patchInlineCommands();
        }
    };
});

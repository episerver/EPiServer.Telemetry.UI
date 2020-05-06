define([
    "dojo/_base/declare",
    "epi-cms/contentediting/command/Publish",
    "epi/_Module",
    "episerver-telemetry-ui/tracker-factory"
], function (
    declare,
    PublishCommand,
    _Module,
    trackerFactory
) {
    return declare([_Module], {
        initialize: function () {
            var originalExecute = PublishCommand.prototype.execute;
            var tracker = trackerFactory.getTracker("cms");

            PublishCommand.prototype.execute = function () {
                tracker.track("publish-test", {
                    test: true
                });

                return originalExecute.apply(this, arguments);
            };
            PublishCommand.prototype.execute.nom = "execute";
        }
    });
});

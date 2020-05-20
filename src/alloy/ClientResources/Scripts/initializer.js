define([
    "dojo/_base/declare",
    "epi-cms/contentediting/command/Publish",
    "epi/_Module",
    "episerver-telemetry-ui/tracker"
], function (
    declare,
    PublishCommand,
    _Module,
    tracker
) {
    return declare([_Module], {
        initialize: function () {
            var originalExecute = PublishCommand.prototype.execute;

            PublishCommand.prototype.execute = function () {
                tracker.track("publishTest", {
                    test: true
                });

                return originalExecute.apply(this, arguments);
            };
            PublishCommand.prototype.execute.nom = "execute";
        }
    });
});

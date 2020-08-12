define([
    "dojo/topic",
    "epi-cms/project/command/AddProject",
    "episerver-telemetry-ui/tracker"
], function (
    topic,
    AddProject,
    tracker
) {
    function patchAddProjectCommand() {
        var originalOnDialogExecute = AddProject.prototype.onDialogExecute;
        AddProject.prototype.onDialogExecute = function () {
            originalOnDialogExecute.apply(this, arguments);
            tracker.trackEvent("project_create");
        };
        AddProject.prototype.onDialogExecute.nom = "onDialogExecute";
    }

    function onShowProjectOverview(args) {
        if (args.uri && args.uri.indexOf("epi.cms.project:///") !== -1) {
            tracker.trackEvent("project_overview");
        }
    }

    return function () {
        topic.subscribe("/epi/shell/context/request", onShowProjectOverview);

        patchAddProjectCommand();
    };
});

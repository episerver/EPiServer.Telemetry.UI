define([
    "dojo/topic",
    "epi/epi",
    "epi-cms/project/command/AddProject",
    "epi-cms/project/viewmodels/ProjectModeToolbarViewModel",
    "epi-cms/project/ProjectSelector",
    "epi-cms/project/ProjectSelectorList",
    "epi-cms/project/ProjectNotification",
    "episerver-telemetry-ui/tracker"
], function (
    topic,
    epi,
    AddProject,
    ProjectModeToolbarViewModel,
    ProjectSelector,
    ProjectSelectorList,
    ProjectNotification,
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

    function patchRemoveProjectCommand() {
        var originalRemoveProject = ProjectModeToolbarViewModel.prototype.removeProject;
        ProjectModeToolbarViewModel.prototype.removeProject = function () {
            originalRemoveProject.apply(this, arguments);
            tracker.trackEvent("project_deleted");
        };
        ProjectModeToolbarViewModel.prototype.removeProject.nom = "removeProject";
    }

    function patchProjectSelector() {
        var originalLoadAndOpenDropDown = ProjectSelector.prototype.loadAndOpenDropDown;
        ProjectSelector.prototype.loadAndOpenDropDown = function () {
            var result = originalLoadAndOpenDropDown.apply(this, arguments);
            tracker.trackEvent("project_openProjectList");
            return result;
        };
        ProjectSelector.prototype.loadAndOpenDropDown.nom = "loadAndOpenDropDown";
    }

    function patchProjectSelectorList() {
        var originalProjectSelected = ProjectSelectorList.prototype._projectSelected;
        ProjectSelectorList.prototype._projectSelected = function (e) {
            // have to call this before original method, because after
            // the current project and selected project will be equal
            var value = e && e.rows && e.rows[0].data;
            if (!epi.areEqual(value, this.get("selectedProject"))) {
                tracker.trackEvent("project_selectProject", { type: "project" });
            }

            return originalProjectSelected.apply(this, arguments);
        };
        ProjectSelectorList.prototype._projectSelected.nom = "_projectSelected";

        var originalDefaultOptionSelected = ProjectSelectorList.prototype._defaultOptionSelected;
        ProjectSelectorList.prototype._defaultOptionSelected = function (e) {
            var result = originalDefaultOptionSelected.apply(this, arguments);

            tracker.trackEvent("project_selectProject", { type: "none" });

            return result;
        };
        ProjectSelectorList.prototype._defaultOptionSelected.nom = "_defaultOptionSelected";
    }

    function patchProjectNotification() {
        if (!ProjectNotification.prototype.loadAndOpenDropDown) {
            return;
        }
        var originalAttachProjectNameClickEvent = ProjectNotification.prototype._attachProjectNameClickEvent;
        ProjectNotification.prototype._attachProjectNameClickEvent = function () {
            var result = originalAttachProjectNameClickEvent.apply(this, arguments);
            tracker.trackEvent("project_clickProjectFromNotification");
            return result;
        };
        ProjectNotification.prototype._attachProjectNameClickEvent.nom = "_attachProjectNameClickEvent";
    }

    return function () {
        var currentContextUri;

        topic.subscribe("/epi/shell/context/request", function (args) {
            var newContextUri = args.uri;
            if (newContextUri && newContextUri.indexOf("epi.cms.project:///") !== -1 && newContextUri !== currentContextUri) {
                tracker.trackEvent("project_overview");
            }

            currentContextUri = newContextUri;
        });

        patchAddProjectCommand();

        patchRemoveProjectCommand();

        patchProjectSelector();

        patchProjectSelectorList();

        patchProjectNotification();
    };
});

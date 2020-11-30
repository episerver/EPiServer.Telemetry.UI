define([
    "dojo/_base/declare",
    "dojo/Deferred",
    "epi/dependency",
    "epi/routes",
    "epi/shell/store/JsonRest",
    "epi/_Module",
    "episerver-telemetry-ui/tracker-factory",
    "episerver-telemetry-ui/common-properties",
    "episerver-telemetry-ui/track-edit-mode",
    "episerver-telemetry-ui/track-projects",
    "episerver-telemetry-ui/track-creation",
    "episerver-telemetry-ui/track-quick-edit",
    "episerver-telemetry-ui/track-panes",
    "episerver-telemetry-ui/tracker"
], function (
    declare,
    Deferred,
    dependency,
    routes,
    JsonRest,
    _Module,
    trackerFactory,
    commonProperties,
    trackEditMode,
    trackProjects,
    trackCreation,
    trackQuickEdit,
    trackPanes,
    tracker
) {
    return declare([_Module], {
        initialize: function () {
            this.inherited(arguments);

            var def = new Deferred();

            var registry = dependency.resolve("epi.storeregistry");

            registry.add("episerver-telemetry-ui.store",
                new JsonRest({
                    target: routes.getRestPath({ moduleArea: "episerver-telemetry-ui", storeName: "telemetryconfig" })
                })
            );

            dependency.resolve("epi.storeregistry")
                .get("episerver-telemetry-ui.store")
                .get().then(function (telemetry) {
                    // Prevent errors when initializing tracker without the instrumentationKey
                    if (telemetry.configuration && telemetry.configuration.instrumentationKey) {
                        trackerFactory.initialize(telemetry.configuration, telemetry.user, telemetry.client, commonProperties.initialize(telemetry));
                    }
                    trackPanes();
                    tracker.trackEvent("loaded");
                    trackCreation();
                    trackEditMode();
                    trackProjects.initialize();

                    // initialize trackQuickEdit if cms version >= 11.32
                    var cmsVersion = telemetry.versions.cms.split(".");
                    if (cmsVersion[0] > 11 || cmsVersion[1] >= 32) {
                        trackQuickEdit.initialize();
                    }
                }).always(function () {
                    def.resolve();
                });

            return def.promise;
        }
    });
});

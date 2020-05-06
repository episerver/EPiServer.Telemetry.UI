define([
    "dojo/_base/declare",
    "epi/dependency",
    "epi/routes",
    "epi/shell/store/JsonRest",
    "epi/_Module",
    "episerver-telemetry-ui/tracker-factory",
    "episerver-telemetry-ui/get-custom-properties",
    "episerver-telemetry-ui/track-edit-mode"
], function (
    declare,
    dependency,
    routes,
    JsonRest,
    _Module,
    trackerFactory,
    getCustomProperties,
    trackEditMode
) {
    return declare([_Module], {
        initialize: function () {
            this.inherited(arguments);
            var registry = dependency.resolve("epi.storeregistry");

            registry.add("episerver-telemetry-ui.store",
                new JsonRest({
                    target: routes.getRestPath({ moduleArea: "episerver-telemetry-ui", storeName: "telemetryconfig" })
                })
            );
            var options = this._settings.options;

            dependency.resolve("epi.storeregistry")
                .get("episerver-telemetry-ui.store")
                .get().then(function (telemetry) {
                    // Prevent errors when initializing tracker without the instrumentationKey
                    if (telemetry.configuration && telemetry.configuration.instrumentationKey) {
                        trackerFactory.initialize(telemetry.configuration, getCustomProperties(telemetry), telemetry.user, telemetry.client);
                        
                        var tracker = trackerFactory.getTracker("cms");
                        tracker.track("featureOptions", options);
                    }
                });

            trackEditMode();
        }
    });
});

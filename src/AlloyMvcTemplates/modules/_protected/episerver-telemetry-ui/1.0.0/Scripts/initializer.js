define([
    "dojo/_base/declare",
    "dojo/Deferred",
    "epi/dependency",
    "epi/routes",
    "epi/shell/store/JsonRest",
    "epi/_Module",
    "episerver-telemetry-ui/tracker-factory",
    "episerver-telemetry-ui/get-custom-properties",
    "episerver-telemetry-ui/track-edit-mode",
    "episerver-telemetry-ui/tracker"
], function (
    declare,
    Deferred,
    dependency,
    routes,
    JsonRest,
    _Module,
    trackerFactory,
    getCustomProperties,
    trackEditMode,
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
                        trackerFactory.initialize(telemetry.configuration, telemetry.user, telemetry.client, getCustomProperties(telemetry));
                    }
                    tracker.trackEvent("loaded");
                    trackEditMode();
                }).always(function () {
                    def.resolve();
                });

            return def.promise;
        }
    });
});

define([
    "dojo/when",
    "epi/dependency",
    "epi/epi",
    "epi/shell/layout/PinnablePane",
    "episerver-telemetry-ui/common-properties",
    "episerver-telemetry-ui/tracker"
], function (
    when,
    dependency,
    epi,
    PinnablePane,
    commonProperties,
    tracker
) {
    var savedStates = {};

    function updateCommonProperties() {
        // summary:
        //      Update common properties
        //      Combine the side pane properties so the telemetry query is simpler

        var properties = {};
        for (var id in savedStates) {
            var setting = savedStates[id];
            for (var prop in setting) {
                properties[id + "_" + prop] = setting[prop];
            }
        }
        commonProperties.set({
            sidePanes: properties
        });
    }

    function trackPinStateChange(pane) {
        // summary:
        //      Track sidePanes_changed and update common properties

        when(pane._profile.get(pane.id)).then(function (currentState) {

            if (!currentState) {
                return;
            }

            var action;
            var previousState = savedStates[pane.id];

            // Saved state and update common properties
            savedStates[pane.id] = currentState;
            updateCommonProperties();

            if (!previousState || epi.areEqual(previousState, currentState)) {
                // Initial load, do not track
                return;
            }

            // Calculate action based on previous state
            if (previousState.pinned !== currentState.pinned) {
                action = currentState.pinned ? "pin" : "unpin";
            } else if (previousState.visible !== currentState.visible) {
                action = currentState.visible ? "show" : "hide";
            } else if (previousState.size !== currentState.size) {
                action = "resize";
            }

            tracker.trackEvent("sidePanes_changed", {
                action: action,
                origin: pane.id
            });
        });
    }

    function patchPinnablePane() {
        var originalPersist = PinnablePane.prototype.persist;
        PinnablePane.prototype.persist = function () {
            originalPersist.apply(this, arguments);
            try {
                trackPinStateChange(this);
            } catch (e) {
                // Ignore errors
            }
        };
        PinnablePane.prototype.persist.nom = "persist";
    }

    return function () {
        // Update states when initial load
        var profile = dependency.resolve("epi.shell.Profile");
        ["navigation", "tools"].forEach(function (id) {
            when(profile.get(id), function (currentState) {
                if (currentState) {
                    savedStates[id] = currentState;
                    updateCommonProperties();
                }
            });
        });

        patchPinnablePane();
    };
});

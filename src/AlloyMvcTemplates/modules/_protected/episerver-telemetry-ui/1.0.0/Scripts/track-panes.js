define([
    "dojo/aspect",
    "dojo/when",
    "epi/dependency",
    "epi/epi",
    "epi/shell/layout/PinnablePane",
    "episerver-telemetry-ui/common-properties",
    "episerver-telemetry-ui/tracker"
], function (
    aspect,
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

    function trackPinStateChange(id, currentState) {
        // summary:
        //      Track sidePanes_changed and update common properties

        if (!currentState) {
            return;
        }

        var action;
        var previousState = savedStates[id];

        // Saved state and update common properties
        savedStates[id] = currentState;
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
            origin: id
        });
    }

    return function () {
        var sidePaneIds = ["navigation", "tools"];
        var profile = dependency.resolve("epi.shell.Profile");
        // Update states when initial load
        sidePaneIds.forEach(function (id) {
            when(profile.get(id), function (currentState) {
                if (currentState) {
                    savedStates[id] = currentState;
                    updateCommonProperties();
                }
            });
        });
        // Attach tracker to profile setter
        aspect.after(profile, "set", function (id, setting) {
            if (sidePaneIds.indexOf(id) > -1) {
                trackPinStateChange(id, setting);
            }
        }, true);
    };
});

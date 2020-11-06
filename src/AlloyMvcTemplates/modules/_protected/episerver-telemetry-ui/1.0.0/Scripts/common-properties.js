define([], function () {
    // summary:
    //      Common properties that are added to every tracked events.

    var commonProperties = {};

    function getResolutions() {
        var windowInnerWidth = window.innerWidth
            || document.documentElement.clientWidth
            || document.body.clientWidth;
        var windowInnerHeight = window.innerHeight
            || document.documentElement.clientHeight
            || document.body.clientHeight;

        return {
            screenWidth: screen.width,
            screenHeight: screen.height,
            windowInnerWidth: windowInnerWidth,
            windowInnerHeight: windowInnerHeight
        };
    }

    return {
        initialize: function (telemetry) {
            commonProperties = {
                versions: telemetry.versions,
                resolutions: getResolutions(),
                user_hasAdminAccess: telemetry.user_hasAdminAccess,
                user_creationDate: telemetry.user_creationDate
            };
            return commonProperties;
        },

        set: function (properties) {
            // summary:
            //      Add or update common properties
            //
            // properties: Object
            //      the properties to be added/updated

            if (typeof properties !== "object") {
                return;
            }
            Object.assign(commonProperties, properties);
        }
    };
});

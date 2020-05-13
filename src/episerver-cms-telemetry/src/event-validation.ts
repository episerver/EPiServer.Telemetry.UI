// RegExp matches camelCased words separated by underline. Applies to event and property name.
const namingConventionRegex = /^[a-z][a-zA-Z]*(_[a-z][a-zA-Z]*)*$/;

function validateEvent(eventName) {
    if (namingConventionRegex.test(eventName)) {
        return true;
    } else {
        console.error(`Event "${eventName}" doesn't match camelCase format, see https://wiki.episerver.net/display/CMSUI/Event+Naming+Convention`);
        return false;
    }
}

function validateData(data) {
    let result = true;
    for (const property in data) {
        if (!namingConventionRegex.test(property)) {
            result = false;
            console.error(`Property "${property}" doesn't match camelCase format, see https://wiki.episerver.net/display/CMSUI/Event+Naming+Convention`);
        }
    }
    return result;
}

export function validate(eventName, data) {
    return validateEvent(eventName) && validateData(data);
}

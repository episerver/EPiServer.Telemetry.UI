import { validate } from './event-validation';

const supportedNames = [
    "cms_edit",                      // standard name
    "camelCase",                     // camel case name
    "camelCase_camelCase_camelCase"  // camel case with underscores
];

const unsupportedNames = [
    "_cms_edit", // starts from underscore
    "cms_edit_", // ends with underscore
    "cms-edit",  // contains dash
    "cms__edit", // contains double underscores
    "cms_edit1", // contains numbers
    "Cms_edit",  // upper camel case
    "cms_Edit"   // upper camel case with underscores
];

describe("#validate", () => {

    test.each(supportedNames)("returns `true` when event name contains '%s'", name => {
        expect(validate(name, null)).toBe(true);
    });

    test.each(unsupportedNames)("returns `false` when event name contains '%s'", name => {
        expect(validate(name, null)).toBe(false);
    });

    describe("when event name is valid", () => {
        const eventName = "cms_edit";

        test.each(supportedNames)("returns `true` when data name contains '%s'", name => {
            const data = {
                cms_info: "!@#$%^&*(_",
                cms_content: "--------",
            };
            data[name] = "!@#$%^&*(_";
            expect(validate(eventName, data)).toBe(true);
        });

        test.each(unsupportedNames)("returns `false` when data name contains '%s'", name => {
            const data = {
                cms_info: "!@#$%^&*(_",
                cms_content: "--------",
            };
            data[name] = "!@#$%^&*(_";
            expect(validate(eventName, data)).toBe(false);
        });
    });
});


const path = require("path");

const config = {
    resolve: {
        extensions: [".js", ".ts"]
    },
    module: {
        rules: [
            { test: /\.ts$/, loader: "ts-loader" }
        ]
    }
};

const amdOutput = {
    libraryTarget: "amd",
    libraryExport: "default",
    path: path.resolve(__dirname, "./../alloy/modules/_protected/episerver-telemetry-ui/1.0.0/Scripts")
};

const productionConfig = { ...config, devtool: "source-map", mode: "production" };
const developmentConfig = { ...config, devtool: "inline-source-map", mode: "development" };

module.exports = () => {
    return [
        // Those two outputs will be packaged in an npm module
        { ...developmentConfig, entry: "./src/tracker-factory.ts", output: { filename: "tracker-factory.js.uncompressed.js" } },
        { ...productionConfig, entry: "./src/tracker-factory.ts", output: { filename: "tracker-factory.js" } },
        // Those two AMD outputs will be packaged in a nuget package
        { ...developmentConfig, entry: "./src/tracker-factory-amd.ts", output: { ...amdOutput, filename: "tracker-factory.js.uncompressed.js" } },
        { ...productionConfig, entry: "./src/tracker-factory-amd.ts", output: { ...amdOutput, filename: "tracker-factory.js" } }
    ];
};

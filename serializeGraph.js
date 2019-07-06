const path = require('path');
const baseJSBundle = require('metro/src/DeltaBundler/Serializers/baseJSBundle');

const serializeGraph = ({
  entryFile,
  graph,
  prependInner,
  serializerOptions,
  createModuleId,
  transformOptions,
  config,
}) => {
  const fileName = path.basename(entryFile, '.js');
  return baseJSBundle(entryFile, prependInner, graph, {
    processModuleFilter: config.serializer.processModuleFilter,
    createModuleId,
    getRunModuleStatement: config.serializer.getRunModuleStatement,
    dev: transformOptions.dev,
    projectRoot: config.projectRoot,
    runBeforeMainModule: config.serializer.getModulesRunBeforeMainModule(
      path.relative(config.projectRoot, entryFile)
    ),
    runModule: serializerOptions.runModule,
    sourceMapUrl: `${fileName}.jsbundle.map`,
    inlineSourceMap: serializerOptions.inlineSourceMap,
  });
};

module.exports = serializeGraph;

const path = require('path');
const writeFile = require('metro/src/shared/output/writeFile');
const bundleToString = require('metro/src/lib/bundle-modules/DeltaClient/bundleToString');
const sourceMapString = require('metro/src/DeltaBundler/Serializers/sourceMapString');

const generateOutput = async ({
  entryFile,
  bundleOutputDir,
  createModuleId,
  bundle,
  prependInner,
  graph,
  serializerOptions,
  config,
}) => {
  const fileName = path.basename(entryFile, '.js');
  const outputOpts = {
    bundleOutput: `${bundleOutputDir}/${fileName}.jsbundle`,
    sourceMapOutput: `${bundleOutputDir}/${fileName}.jsbundle.map`,
    bundleEncoding: 'utf8',
  };

  // Save the bundle
  await writeFile(
    outputOpts.bundleOutput,
    bundleToString(bundle).code,
    outputOpts.bundleEncoding
  );

  // Save sourcemap
  const getSortedModules = graph => {
    return [...graph.dependencies.values()].sort(
      (a, b) => createModuleId(a.path) - createModuleId(b.path)
    );
  };
  const sourceMap = sourceMapString(
    [...prependInner, ...getSortedModules(graph)],
    {
      excludeSource: serializerOptions.excludeSource,
      processModuleFilter: config.serializer.processModuleFilter,
    }
  );
  await writeFile(outputOpts.sourceMapOutput, sourceMap, null);
};

module.exports = generateOutput;

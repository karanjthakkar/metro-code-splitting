const path = require('path');
const loadMetroConfig = require('@react-native-community/cli/build/tools/loadMetroConfig')
  .default;
const loadConfig = require('@react-native-community/cli/build/tools/config')
  .default;
const splitBundleOptions = require('metro/src/lib/splitBundleOptions');
const Server = require('metro/src/Server');

const generateGraph = require('./generateGraph');
const generateDependencyGraphForEachSplitPoint = require('./generateDependencyGraphForEachSplitPoint');
const serializeGraph = require('./serializeGraph');
const generateOutput = require('./generateOutput');

const run = async args => {
  const dev = args.dev || false;
  const config = await loadMetroConfig(loadConfig());
  const requestOpts = {
    dev: dev,
    entryFile: path.resolve(args.entryFile),
    platform: args.platform,
    minify: !dev,
  };
  const options = {
    ...Server.DEFAULT_BUNDLE_OPTIONS,
    ...requestOpts,
    bundleType: 'bundle',
  };
  const { entryFile, transformOptions, serializerOptions } = splitBundleOptions(
    options
  );

  // Create bundle graph
  const { prepend, graph } = await generateGraph(
    entryFile,
    transformOptions,
    config
  );

  // Create split graph from main graph
  const splitGraph = generateDependencyGraphForEachSplitPoint(
    [entryFile],
    graph
  );

  const createModuleId = config.serializer.createModuleIdFactory();
  splitGraph.forEach(async (graph, index) => {
    const entryFile = graph.entryPoints[0];
    const prependInner = index === 0 ? prepend : [];

    // Serialize bundle
    const bundle = serializeGraph({
      entryFile,
      prependInner,
      graph,
      config,
      createModuleId,
      transformOptions,
      serializerOptions,
    });

    // Write output to disk
    await generateOutput({
      entryFile,
      bundleOutDir: args.bundleOutDir,
      createModuleId,
      bundle,
      prependInner,
      graph,
      serializerOptions,
      config,
    });
  });
};

module.exports = run;

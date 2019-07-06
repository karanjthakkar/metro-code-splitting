const IncrementalBundler = require('metro/src/IncrementalBundler');

const generateGraph = async (entryFile, transformOptions, config) => {
  const bundler = new IncrementalBundler(config);
  const { prepend, graph } = await bundler.buildGraph(
    entryFile,
    transformOptions
  );
  await bundler.end();
  return { prepend, graph };
};

module.exports = generateGraph;

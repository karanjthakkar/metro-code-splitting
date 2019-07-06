const generateDependencyGraphForEachSplitPoint = (
  entryFiles,
  graph,
  multiBundles = new Map(),
  used = new Set()
) => {
  entryFiles.forEach(entryFile => {
    if (multiBundles.has(entryFile)) {
      return multiBundles;
    }

    const result = getTransitiveDependencies(entryFile, graph, used);
    multiBundles.set(entryFile, result.deps);
    used = new Set([...used, ...result.deps]);

    if (result.entries.size > 0) {
      generateDependencyGraphForEachSplitPoint(
        result.entries,
        graph,
        multiBundles,
        used
      );
    }
  });

  return buildDependenciesForEachSplitPoint(multiBundles, graph);
};

const getTransitiveDependencies = (path, graph, used) => {
  const result = _getDeps(path, graph, new Set(), new Set(), used); // Remove the main entry point, since this method only returns the
  // dependencies.

  result.deps.delete(path);
  return result;
};

const _getDeps = (path, graph, deps, entries, used) => {
  if (deps.has(path) || used.has(path)) {
    return { deps, entries };
  }

  const module = graph.dependencies.get(path);

  if (!module) {
    return { deps, entries };
  }

  deps.add(path);

  for (const dependency of module.dependencies.values()) {
    if (!dependency.data.data.isAsync) {
      _getDeps(dependency.absolutePath, graph, deps, entries, used);
    } else {
      entries.add(dependency.absolutePath);
    }
  }

  return { deps, entries };
};

const buildDependenciesForEachSplitPoint = (multiBundles, graph) => {
  return [...multiBundles.entries()].map(bundle => {
    return {
      dependencies: new Map([
        [bundle[0], graph.dependencies.get(bundle[0])],
        ...[...bundle[1].values()].map(dep => [
          dep,
          graph.dependencies.get(dep),
        ]),
      ]),
      entryPoints: [bundle[0]],
    };
  });
};

module.exports = generateDependencyGraphForEachSplitPoint;

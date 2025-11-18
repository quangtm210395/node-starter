import path from 'path';

import { globSync } from 'glob';

import { WinstonLogger } from '@Libs/WinstonLogger';

const logger = WinstonLogger.create(module);

function resolvePattern(pattern: string): string[] {
  const absolutePattern = path.isAbsolute(pattern) ? pattern : path.join(process.cwd(), pattern);
  let matches = globSync(absolutePattern, { nodir: true });

  if (matches.length === 0 && absolutePattern.includes(`${path.sep}src${path.sep}`)) {
    const distPattern = absolutePattern
      .replace(`${path.sep}src${path.sep}`, `${path.sep}dist${path.sep}`)
      .replace(/\.ts$/, '.js');
    matches = globSync(distPattern, { nodir: true });
  }

  return matches;
}

export async function loadModulesFromPatterns(
  patterns: string[],
  description: string,
): Promise<void> {
  const loaded = new Set<string>();
  for (const pattern of patterns) {
    if (!pattern) {
      continue;
    }

    const resolved = resolvePattern(pattern);
    if (!resolved.length) {
      logger.warn(`No matches found for ${description} pattern: ${pattern}`);
      continue;
    }

    for (const file of resolved) {
      if (loaded.has(file)) {
        continue;
      }
      try {
        await import(file);
        loaded.add(file);
        logger.info(`Loaded ${description} from ${pattern}`);
      } catch (error) {
        logger.error(`Failed to load ${description} at ${file}`, error);
      }
    }
  }
}

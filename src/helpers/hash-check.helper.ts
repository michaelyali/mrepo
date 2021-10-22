import { isString } from '@nestled/util';
import { hashElement } from 'folder-hash';
import { ensureFile, readJson, writeJson } from 'fs-extra';
import { join } from 'path';
import { TMP_BUILDS_CACHE_FILE_NAME, TMP_FOLDER_NAME } from '../constants';
import { IBuildsCache } from '../interfaces';

const TMP_BUILDS_CACHE_FILE_PATH = join(process.cwd(), TMP_FOLDER_NAME, TMP_BUILDS_CACHE_FILE_NAME);

export async function hasCached(workspaceName: string, packageName: string): Promise<boolean> {
  const cacheFile = await ensureBuildsCacheFile();
  const savedCache: IBuildsCache[any] = cacheFile[packageName] || {};
  const paths = getPaths(workspaceName, packageName);
  const hashes = await getHashes(paths);

  return savedCache.src === hashes.src && savedCache.lib === hashes.lib && isString(hashes.lib);
}

export async function saveCache(workspaceName: string, packageName: string) {
  const cacheFile = await ensureBuildsCacheFile();
  const paths = getPaths(workspaceName, packageName);
  const hashes = await getHashes(paths);

  await writeJson(TMP_BUILDS_CACHE_FILE_PATH, {
    ...cacheFile,
    [packageName]: hashes,
  });
}

function getPaths(workspaceName: string, packageName: string): { src: string; lib: string } {
  const packagePath = join(process.cwd(), workspaceName, packageName);
  const src = join(packagePath, 'src');
  const lib = join(packagePath, 'lib');

  return { src, lib };
}

async function ensureBuildsCacheFile(): Promise<IBuildsCache> {
  await ensureFile(TMP_BUILDS_CACHE_FILE_PATH);

  const buildsCacheFile = await readJson(TMP_BUILDS_CACHE_FILE_PATH, { throws: false });

  if (!buildsCacheFile) {
    await writeJson(TMP_BUILDS_CACHE_FILE_PATH, {});
    return {};
  }

  return buildsCacheFile;
}

async function getOneHash(path: string): Promise<string> {
  try {
    const hash = await hashElement(path);
    return hash?.hash;
  } catch (e) {
    return undefined;
  }
}

async function getHashes(paths: { src: string; lib: string }): Promise<{ src: string; lib: string }> {
  const [src, lib] = await Promise.all([getOneHash(paths.src), await getOneHash(paths.lib)]);
  return { src, lib };
}

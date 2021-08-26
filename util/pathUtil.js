import { fileURLToPath } from 'url';
import path from 'path';

// get url from import.meta.url
export const dirnameFromImportMetaUrl = (url) => {
  return path.dirname(fileURLToPath(url));
};
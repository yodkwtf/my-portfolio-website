import { logger } from '@/lib/logger';

export interface GitHubRepo {
  owner: string;
  repo: string;
  /** Subfolder path inside the repo (e.g. "02-smooth-page-transiitons"). */
  subpath?: string;
}

/**
 * Extracts { owner, repo, subpath } from a GitHub URL.
 *
 * Handles both root repo URLs (`github.com/owner/repo`) and subfolder URLs
 * (`github.com/owner/repo/tree/branch/path/to/folder`).
 */
export function parseGitHubRepo(url?: string): GitHubRepo | null {
  if (!url) return null;
  try {
    const { hostname, pathname } = new URL(url);
    if (hostname !== 'github.com' && hostname !== 'www.github.com') {
      return null;
    }
    const segments = pathname.split('/').filter(Boolean);
    const [owner, repo] = segments;
    if (!owner || !repo) return null;

    let subpath: string | undefined;
    // URLs like /owner/repo/tree/branch/folder/nested
    if (segments[2] === 'tree' && segments.length > 4) {
      // segments[3] is the branch name, everything after is the path
      subpath = segments.slice(4).map(decodeURIComponent).join('/');
    }

    return { owner, repo: repo.replace(/\.git$/, ''), subpath };
  } catch {
    return null;
  }
}

async function fetchReadmeAt(
  owner: string,
  repo: string,
  dir?: string,
): Promise<string | null> {
  const dirParam = dir ? `/${encodeURIComponent(dir)}` : '';
  try {
    const res = await fetch(
      `https://api.github.com/repos/${owner}/${repo}/readme${dirParam}`,
      {
        headers: { Accept: 'application/vnd.github.raw+json' },
        next: { revalidate: 3600 },
      },
    );
    if (res.ok) return await res.text();
  } catch {
    // fall through
  }

  const rawPath = dir ? `${dir}/README.md` : 'README.md';
  try {
    const res = await fetch(
      `https://raw.githubusercontent.com/${owner}/${repo}/HEAD/${rawPath}`,
      { next: { revalidate: 3600 } },
    );
    if (res.ok) return await res.text();
  } catch {
    // fall through
  }

  return null;
}

/**
 * Fetches the raw README markdown for a repo. When a subpath is present,
 * tries that subfolder's README first, then falls back to the repo root.
 *
 * READMEs change rarely, so the fetch is cached for an hour - this also
 * keeps us well under the unauthenticated API rate limit.
 */
export async function fetchReadme({
  owner,
  repo,
  subpath,
}: GitHubRepo): Promise<string | null> {
  if (subpath) {
    const sub = await fetchReadmeAt(owner, repo, subpath);
    if (sub) return sub;
    logger.info(
      'fetchReadme',
      `No README in ${owner}/${repo}/${subpath}, trying repo root`,
    );
  }

  return fetchReadmeAt(owner, repo);
}

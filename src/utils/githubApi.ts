import yaml from 'js-yaml';
import { GitHubFileResponse, ServicesConfig } from '../types';

// GitHub repository configuration
const GITHUB_REPO = 'spencerjirehcebrian/asd';
const CONFIG_FILE_PATH = 'public/config/services.yml';
const GITHUB_TOKEN = import.meta.env.REACT_APP_GITHUB_TOKEN; // Optional

/**
 * GitHub API client with ETag support and rate limit handling
 */
export class GitHubApiClient {
  private baseUrl = 'https://api.github.com';
  private repo = GITHUB_REPO;
  private filePath = CONFIG_FILE_PATH;

  /**
   * Get authorization headers if token is available
   */
  private getHeaders(etag?: string): HeadersInit {
    const headers: HeadersInit = {
      'Accept': 'application/vnd.github.v3+json',
      'User-Agent': 'ASD-Dashboard/1.0',
    };

    // Add authorization if token is available
    if (GITHUB_TOKEN) {
      headers['Authorization'] = `token ${GITHUB_TOKEN}`;
    }

    // Add ETag for conditional requests
    if (etag) {
      headers['If-None-Match'] = etag;
    }

    return headers;
  }

  /**
   * Parse base64 encoded content and handle both YAML and JSON
   */
  private parseContent(content: string, encoding: string): ServicesConfig {
    // Decode base64 content
    const decodedContent = encoding === 'base64' 
      ? atob(content.replace(/\s/g, '')) 
      : content;

    try {
      // Try parsing as YAML first (supports JSON too)
      const parsed = yaml.load(decodedContent) as ServicesConfig;
      
      // Validate the structure
      if (!parsed || !parsed.services || !Array.isArray(parsed.services)) {
        throw new Error('Invalid services configuration structure');
      }

      return parsed;
    } catch (yamlError) {
      // Fallback to JSON parsing
      try {
        return JSON.parse(decodedContent) as ServicesConfig;
      } catch (jsonError) {
        throw new Error(`Failed to parse configuration: ${yamlError}`);
      }
    }
  }

  /**
   * Fetch configuration from GitHub with ETag support
   */
  public async fetchConfig(cachedEtag?: string): Promise<{
    data: ServicesConfig;
    etag: string;
    fromCache: boolean;
  }> {
    const url = `${this.baseUrl}/repos/${this.repo}/contents/${this.filePath}`;
    const headers = this.getHeaders(cachedEtag);

    try {
      const response = await fetch(url, { headers });

      // Handle rate limiting
      if (response.status === 403) {
        const resetTime = response.headers.get('X-RateLimit-Reset');
        const remaining = response.headers.get('X-RateLimit-Remaining');
        
        throw new Error(
          `GitHub API rate limit exceeded. ` +
          `Remaining: ${remaining}, Reset: ${resetTime ? new Date(parseInt(resetTime) * 1000).toLocaleTimeString() : 'unknown'}`
        );
      }

      // Handle 304 Not Modified (content hasn't changed)
      if (response.status === 304 && cachedEtag) {
        throw new Error('NOT_MODIFIED'); // Special error to indicate cache is still valid
      }

      // Handle other errors
      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`);
      }

      const fileData: GitHubFileResponse = await response.json();
      const etag = response.headers.get('etag') || '';
      
      // Parse the configuration
      const config = this.parseContent(fileData.content, fileData.encoding);

      return {
        data: config,
        etag,
        fromCache: false,
      };

    } catch (error) {
      if (error instanceof Error && error.message === 'NOT_MODIFIED') {
        // Re-throw to be handled by caller
        throw error;
      }

      // Enhanced error handling
      if (error instanceof TypeError && error.message.includes('fetch')) {
        throw new Error('Network error: Unable to connect to GitHub API. Check your internet connection.');
      }

      throw error;
    }
  }

  /**
   * Get API rate limit status
   */
  public async getRateLimitStatus(): Promise<{
    limit: number;
    remaining: number;
    reset: Date;
    used: number;
  }> {
    const url = `${this.baseUrl}/rate_limit`;
    const headers = this.getHeaders();

    try {
      const response = await fetch(url, { headers });
      const data = await response.json();

      return {
        limit: data.rate.limit,
        remaining: data.rate.remaining,
        reset: new Date(data.rate.reset * 1000),
        used: data.rate.used,
      };
    } catch (error) {
      throw new Error(`Failed to fetch rate limit status: ${error}`);
    }
  }

  /**
   * Check if the API is available and responding
   */
  public async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/rate_limit`, {
        headers: this.getHeaders(),
        signal: AbortSignal.timeout(5000), // 5 second timeout
      });
      return response.ok;
    } catch {
      return false;
    }
  }
}

// Export default GitHub API client instance
export const githubApi = new GitHubApiClient();
import { Injectable, Logger } from '@nestjs/common';
import axios, { AxiosInstance } from 'axios';

@Injectable()
export class GithubService {
    private readonly baseUrl = 'https://api.github.com';
    private readonly token: string;
    private readonly logger = new Logger(GithubService.name);
    private axios: AxiosInstance;

    constructor() {
        this.token = process.env.GITHUB_TOKEN || '';
        if (!this.token) {
            this.logger.warn('GitHub token not set in environment variables!');
        }
        this.axios = axios.create({
            baseURL: this.baseUrl,
            headers: {
                Accept: 'application/vnd.github.v3+json',
                Authorization: `Bearer ${process.env.GITHUB_PAT}`,
                'User-Agent': 'YourAppName',
            },
        });
    }

    private async checkRateLimit(headers: any) {
        const remaining = parseInt(headers['x-ratelimit-remaining'] || '0');
        const reset = parseInt(headers['x-ratelimit-reset'] || '0') * 1000; // convert to ms
        if (remaining === 0) {
            const waitTime = reset - Date.now();
            if (waitTime > 0) {
                console.log(`Rate limit exceeded, waiting ${waitTime / 1000}s before retrying...`);
                await new Promise(res => setTimeout(res, waitTime));
            }
        }
    }

    async getCommits(owner: string, repo: string, branch = 'main', perPage = 100, page = 1): Promise<any[]> {
        try {
            const response = await this.axios.get(`/repos/${owner}/${repo}/commits`, {
                params: {
                    sha: branch,
                    per_page: perPage,
                    page: page,
                },
            });

            await this.checkRateLimit(response.headers);

            return response.data;

        } catch (error) {
            if (error.response?.status === 404) {
                this.logger.error(`Repository or branch not found: ${owner}/${repo}@${branch}`);
            }
            this.logger.error('Error fetching commits from GitHub', error.response?.data || error.message);
            throw error;
        }
    }

    async getCommitDiff(owner: string, repo: string, sha: string): Promise<any> {
        try {
            const response = await this.axios.get(`/repos/${owner}/${repo}/commits/${sha}`, {
                headers: {
                    Accept: 'application/vnd.github.v3.diff',
                },
            });

            await this.checkRateLimit(response.headers);
            return response.data;

        } catch (error) {
            this.logger.error('Error fetching commit diff', error.response?.data || error.message);
            throw error;
        }
    }
}

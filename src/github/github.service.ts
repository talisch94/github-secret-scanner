import { Injectable, Logger } from '@nestjs/common';
import axios from 'axios';

@Injectable()
export class GithubService {
    private readonly baseUrl = 'https://api.github.com';
    private readonly token: string;
    private readonly logger = new Logger(GithubService.name);

    constructor() {
        this.token = process.env.GITHUB_TOKEN || '';
        if (!this.token) {
            this.logger.warn('GitHub token not set in environment variables!');
        }
    }

    private getHeaders() {
        return {
            Authorization: `Bearer ${this.token}`,
            Accept: 'application/vnd.github.v3+json',
        };
    }

    async getCommits(owner: string, repo: string, branch = 'main', perPage = 100, page = 1): Promise<any[]> {
        const url = `${this.baseUrl}/repos/${owner}/${repo}/commits`;
        try {
            const response = await axios.get(url, {
                headers: this.getHeaders(),
                params: {
                    sha: branch,
                    per_page: perPage,
                    page,
                },
            });
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
        const url = `${this.baseUrl}/repos/${owner}/${repo}/commits/${sha}`;
        try {
            const response = await axios.get(url, {
                headers: {
                    ...this.getHeaders(),
                    Accept: 'application/vnd.github.v3.diff', // for a textual diff
                },
            });
            return response.data;
        } catch (error) {
            this.logger.error('Error fetching commit diff', error.response?.data || error.message);
            throw error;
        }
    }
}

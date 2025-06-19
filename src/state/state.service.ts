import { Injectable } from '@nestjs/common';
import * as fs from 'fs';
import * as path from 'path';

@Injectable()
export class StateService {
    private readonly stateFile = path.join(process.cwd(), 'scan-state.json');

    private state: Record<string, { branch: string; lastSha: string }> = {};

    constructor() {
        this.loadState();
    }

    private loadState() {
        if (fs.existsSync(this.stateFile)) {
            const fileContent = fs.readFileSync(this.stateFile, 'utf-8');
            this.state = JSON.parse(fileContent);
        }
    }

    private saveState() {
        fs.writeFileSync(this.stateFile, JSON.stringify(this.state, null, 2));
    }

    getLastSha(owner: string, repo: string, branch: string): string | null {
        const key = `${owner}/${repo}`;
        return this.state[key]?.lastSha || null;
    }

    setLastSha(owner: string, repo: string, branch: string, sha: string) {
        const key = `${owner}/${repo}`;
        this.state[key] = { branch, lastSha: sha };
        this.saveState();
    }
}

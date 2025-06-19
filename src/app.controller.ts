// src/app.controller.ts
import { Controller, Get, Query, Logger } from '@nestjs/common';
import { GithubService } from './github/github.service';
import { ScannerService } from './scanner/scanner.service';
import { StateService } from './state/state.service';
import { CommitLeak } from './models/CommitLeak.interface';

@Controller()
export class AppController {
    private readonly logger = new Logger(AppController.name);

    constructor(
        private readonly githubService: GithubService,
        private readonly scannerService: ScannerService,
        private readonly stateService: StateService,
    ) { }

    @Get('scan')
    async scanRepo(
        @Query('owner') owner: string,
        @Query('repo') repo: string,
        @Query('branch') branch = 'main',
    ) {
        if (!owner || !repo) {
            return { error: 'Missing owner or repo query parameters' };
        }

        const leaks: CommitLeak[] = [];
        let page = 1;
        let continueFromSha = this.stateService.getLastSha(owner, repo, branch);

        this.logger.log(`Starting scan for ${owner}/${repo}@${branch} from SHA: ${continueFromSha || 'start'}`);

        while (true) {
            const commits = await this.githubService.getCommits(owner, repo, branch, 100, page);
            if (commits.length === 0) break;

            let startIndex = 0;
            if (continueFromSha) { // skip commits until the desired SHA
                startIndex = commits.findIndex(c => c.sha === continueFromSha) + 1;
                if (startIndex === 0) startIndex = commits.length; // will scan everything
            }

            for (let i = startIndex; i < commits.length; i++) {
                const commit = commits[i];
                console.log(`Commit SHA: ${commit.sha}, Date: ${commit.commit.committer.date}`);

                const diff = await this.githubService.getCommitDiff(owner, repo, commit.sha);
                const foundKeys = this.scannerService.scanDiff(diff);

                if (foundKeys.length > 0) {
                    leaks.push({
                        commitSha: commit.sha,
                        committer: commit.commit?.committer?.name,
                        leaks: foundKeys,
                    });
                }

                // updates last value
                this.stateService.setLastSha(owner, repo, branch, commit.sha);
            }

            // means this is the end
            if (commits.length < 100) break;
            page++;
        }
        console.log(`Scanning is completed`);

        return { leaks };
    }
}

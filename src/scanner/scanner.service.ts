import { Injectable, Logger } from '@nestjs/common';

@Injectable()
export class ScannerService {
    private readonly logger = new Logger(ScannerService.name);

    private readonly awsAccessKeyRegex = /(A3T[A-Z0-9]|AKIA|ASIA|ANPA)[A-Z0-9]{16}/g;
    private readonly awsSecretKeyRegex = /([A-Za-z0-9/+=]{40})/g;

    scanDiff(diffText: string): string[] {
        const matches: string[] = [];

        const accessKeys = diffText.match(this.awsAccessKeyRegex);
        if (accessKeys) {
            matches.push(...accessKeys);
            this.logger.log(`Found AWS keys: ${matches.join(', ')}`);
        }

        const secretKeyMatches = [...diffText.matchAll(this.awsSecretKeyRegex)];
        for (const match of secretKeyMatches) {
            const candidate = match[1];
            if (candidate.length === 40) { // AWS Secret Access Key length
                matches.push(candidate);
            }
        }

        return matches;
    }
}

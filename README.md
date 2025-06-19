# GitHub AWS Secrets Scanner
A Node.js NestJS application to scan GitHub repository commits for potential AWS secret leaks.

## Overview
This app uses the GitHub API to scan commit histories of a specified repository and branch (default: main). It examines the diffs of all changed files in each commit to identify potential AWS access keys and secret keys using regex patterns.

## Prerequisites
Node.js v16 or higher

A GitHub Personal Access Token (PAT) with at least read access to the target repository. For public repos, no special permissions are needed.

## Installation & Setup
1. Clone the repository:

git clone https://github.com/yourusername/github-aws-secrets-scanner.git
cd github-aws-secrets-scanner

2. Install dependencies:
npm install

3. Configure environment variables - Create a .env file in the project root with:

GITHUB_TOKEN=github_pat_yourtokenhere
PORT=3000

Replace github_pat_yourtokenhere with your actual GitHub token.

4. Run the app:

npm run start


## Usage

Scan a repository
Send a GET request to:
http://localhost:3000/scan?owner={owner}&repo={repo}&branch={branch}
* owner — GitHub username or organization (required)
* repo — Repository name (required)
* branch — Branch name (optional, default: main)

Example:
curl "http://localhost:3000/scan?owner=vercel&repo=next.js&branch=canary"

## Response format
The API returns a JSON object listing found leaks:

{
  "leaks": [
    {
      "commitSha": "123abc...",
      "committer": "John Doe",
      "leaks": [
        "AKIAIOSFODNN7EXAMPLE",
        "wJalrXUtnFEMI/K7MDENG/bPxRfiCYEXAMPLEKEY"
      ]
    }
  ]
}

## How it works
The scan continues from the last scanned commit SHA.
For each commit, all file diffs are retrieved.
Regex scans diffs for AWS access keys and secret keys.
If leaks are found, commit SHA, committer, and leaked keys are returned.

Pagination and GitHub API rate limits are handled carefully.
Scan state is persisted in a local JSON file.

## Notes and limitations
Ensure your GitHub token has sufficient permissions for private repos.
Be mindful of GitHub API rate limits during scanning.
The app currently scans one branch at a time.

## Optional: Docker usage
Build and run with Docker:

FROM node:18

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "start"]


Build and run:

docker build -t github-aws-scanner .
docker run -p 3000:3000 --env GITHUB_TOKEN=your_token_here github-aws-scanner

## Contact
For questions or issues, contact: tali.schvartz@gmail.com

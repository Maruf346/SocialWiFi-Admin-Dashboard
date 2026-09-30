# RightRoute Dashboard Deployment Guide: S3 + CloudFront + GitHub Actions

This guide deploys the admin dashboard as a static frontend app using:

- Amazon S3 for static files
- Amazon CloudFront for CDN, HTTPS, caching, and SPA routing
- AWS Certificate Manager for SSL
- Route 53 or your DNS provider for the domain
- GitHub Actions for CI/CD
- GitHub OIDC for secure AWS authentication without long-lived AWS keys

The production bucket name used in this guide is:

```text
rightroute-dashboard
```

The recommended structure is:

```text
s3://rightroute-dashboard/
  admin/
    index.html
    assets/...
  team/
    index.html
    assets/...
```

For now, deploy only the admin dashboard to:

```text
s3://rightroute-dashboard/admin/
```

Later, the team dashboard can deploy to:

```text
s3://rightroute-dashboard/team/
```

## 1. Decide The URL Structure

Recommended:

```text
https://admin.getrightroute.app/
https://team.getrightroute.app/
```

This is cleaner than:

```text
https://dashboard.getrightroute.app/admin/
https://dashboard.getrightroute.app/team/
```

Why subdomains are recommended:

- each dashboard can have clean frontend routes like `/users`, `/settings`, `/reports`
- fewer issues with React Router basename configuration
- can use one CloudFront distribution, with host-based routing added later for the team dashboard
- clearer separation between admin and team products

This guide uses the live RightRoute domains:

```text
admin.getrightroute.app
team.getrightroute.app
```

## 2. Confirm The Build Output Folder

Run locally:

```bash
npm install
npm run build
```

After the build, check which folder is generated:

```text
dist/
```

or:

```text
build/
```

Most Vite apps use:

```text
dist/
```

Create React App usually uses:

```text
build/
```

In the GitHub Actions workflow later, set:

```yaml
BUILD_DIR: dist
```

or:

```yaml
BUILD_DIR: build
```

## 3. Create The S3 Bucket

Go to:

```text
AWS Console -> S3 -> Create bucket
```

Use:

```text
Bucket name: rightroute-dashboard
AWS Region: choose your preferred region
```

Recommended region examples:

```text
ap-south-1      Mumbai
ap-southeast-1  Singapore
us-east-1       N. Virginia
```

Keep these settings:

```text
Block all public access: ON
Bucket versioning: Optional, recommended ON
Default encryption: ON, SSE-S3
Object Ownership: ACLs disabled
```

Do not enable S3 static website hosting if you are using CloudFront with Origin Access Control. CloudFront will access the private bucket directly.

Create these folders manually, or let CI/CD create them during upload:

```text
admin/
team/
```

## 4. Request An SSL Certificate

CloudFront requires ACM certificates to be in:

```text
us-east-1
```

Go to:

```text
AWS Console -> Certificate Manager
```

Switch region to:

```text
US East (N. Virginia) us-east-1
```

Request a public certificate for:

```text
admin.getrightroute.app
```

If you want to prepare for the team dashboard now, request:

```text
admin.getrightroute.app
team.getrightroute.app
```

or use a wildcard:

```text
*.getrightroute.app
```

Choose DNS validation.

If your DNS is in Route 53, AWS can create the validation records automatically. Otherwise, copy the CNAME validation record into your DNS provider.

Wait until the certificate status becomes:

```text
Issued
```

## 5. Create The CloudFront Distribution

Go to:

```text
AWS Console -> CloudFront -> Create distribution
```

### Origin

Use the S3 bucket as the origin:

```text
Origin domain: rightroute-dashboard.s3.<region>.amazonaws.com
Origin path: /admin
Origin access: Origin access control settings
Create new OAC: Yes
```

The live admin dashboard uses `Origin path: /admin`. With that setting, a browser request for `/index.html` is fetched from:

```text
s3://rightroute-dashboard/admin/index.html
```

Name:

```text
rightroute-dashboard-oac
```

Do not use public S3 website endpoint.

### Default Cache Behavior

Use:

```text
Viewer protocol policy: Redirect HTTP to HTTPS
Allowed HTTP methods: GET, HEAD, OPTIONS
Cache policy: CachingOptimized
Origin request policy: CORS-S3Origin, if needed
Compress objects automatically: Yes
```

### Alternate Domain Names

For the current admin dashboard, add:

```text
admin.getrightroute.app
```

When the team dashboard is ready, use the same CloudFront distribution and add:

```text
team.getrightroute.app
```

Select the ACM certificate you created in `us-east-1`.

### Default Root Object

Because the origin path is `/admin`, set the default root object to:

```text
index.html
```

Do not set this to `admin/index.html` when `Origin path` is already `/admin`, otherwise CloudFront may look for `/admin/admin/index.html`.

## 6. Add CloudFront SPA Error Responses

React routes like these do not exist as physical S3 files:

```text
/users
/settings/roles
/fleet-users/123
```

CloudFront needs to serve `index.html` for those routes.

In your CloudFront distribution, go to:

```text
Error pages -> Create custom error response
```

Add:

```text
HTTP error code: 403
Customize error response: Yes
Response page path: /index.html
HTTP response code: 200
Error caching minimum TTL: 0
```

Add another:

```text
HTTP error code: 404
Customize error response: Yes
Response page path: /index.html
HTTP response code: 200
Error caching minimum TTL: 0
```

## 7. Update The S3 Bucket Policy For CloudFront

After creating the CloudFront distribution with OAC, CloudFront usually shows a bucket policy that you should copy.

It will look similar to this:

```json
{
  "Version": "2008-10-17",
  "Statement": [
    {
      "Sid": "AllowCloudFrontServicePrincipal",
      "Effect": "Allow",
      "Principal": {
        "Service": "cloudfront.amazonaws.com"
      },
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::rightroute-dashboard/*",
      "Condition": {
        "StringEquals": {
          "AWS:SourceArn": "arn:aws:cloudfront::<AWS_ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
        }
      }
    }
  ]
}
```

Replace:

```text
<AWS_ACCOUNT_ID>
<DISTRIBUTION_ID>
```

Then add it here:

```text
S3 -> rightroute-dashboard -> Permissions -> Bucket policy
```

Keep public access blocked.

## 8. Create DNS Record

If using Route 53:

Go to:

```text
Route 53 -> Hosted zones -> getrightroute.app -> Create record
```

Create the admin record now:

```text
Record name: admin
Record type: A
Alias: Yes
Route traffic to: CloudFront distribution
```

When the team dashboard is ready, create another record pointing to the same distribution:

```text
Record name: team
Record type: A
Alias: Yes
Route traffic to: CloudFront distribution
```

Also create an IPv6 record if desired:

```text
Record type: AAAA
Alias: Yes
Route traffic to: CloudFront distribution
```

If using another DNS provider:

Create CNAME records that point to the same CloudFront distribution domain:

```text
admin.getrightroute.app -> <your-cloudfront-domain>.cloudfront.net
team.getrightroute.app  -> <your-cloudfront-domain>.cloudfront.net
```

Only add the `team.getrightroute.app` app routing when the team dashboard files and CloudFront routing are ready.

## 9. Create GitHub OIDC Provider In AWS

This allows GitHub Actions to deploy without storing permanent AWS keys.

Go to:

```text
AWS Console -> IAM -> Identity providers -> Add provider
```

Use:

```text
Provider type: OpenID Connect
Provider URL: https://token.actions.githubusercontent.com
Audience: sts.amazonaws.com
```

Create the provider.

## 10. Create IAM Policy For Deployment

Go to:

```text
IAM -> Policies -> Create policy -> JSON
```

Use this policy.

Replace:

```text
<AWS_ACCOUNT_ID>
<DISTRIBUTION_ID>
```

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "AllowAdminDashboardS3Deploy",
      "Effect": "Allow",
      "Action": [
        "s3:PutObject",
        "s3:DeleteObject",
        "s3:GetObject",
        "s3:ListBucket"
      ],
      "Resource": [
        "arn:aws:s3:::rightroute-dashboard",
        "arn:aws:s3:::rightroute-dashboard/admin/*"
      ]
    },
    {
      "Sid": "AllowCloudFrontInvalidation",
      "Effect": "Allow",
      "Action": [
        "cloudfront:CreateInvalidation"
      ],
      "Resource": "arn:aws:cloudfront::<AWS_ACCOUNT_ID>:distribution/<DISTRIBUTION_ID>"
    }
  ]
}
```

Name it:

```text
rightroute-admin-dashboard-deploy-policy
```

## 11. Create IAM Role For GitHub Actions

Go to:

```text
IAM -> Roles -> Create role
```

Choose:

```text
Trusted entity type: Web identity
Identity provider: token.actions.githubusercontent.com
Audience: sts.amazonaws.com
```

For GitHub organization/repository, AWS may let you enter it in the UI. If not, create the role first and then edit the trust policy manually.

Attach the policy:

```text
rightroute-admin-dashboard-deploy-policy
```

Name the role:

```text
rightroute-admin-dashboard-github-actions-role
```

### Trust Policy

Edit the role trust relationship to this.

Replace:

```text
<AWS_ACCOUNT_ID>
<GITHUB_OWNER>
<GITHUB_REPO>
```

For this repository, GitHub is using an ID-based OIDC `sub` claim. The actual value seen in GitHub Actions is:

```text
repo:Maruf346@117565778/SocialWiFi-Admin-Dashboard@1361011002:ref:refs/heads/main
```

Use that exact value in the trust policy.

Trust policy:

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Effect": "Allow",
      "Principal": {
        "Federated": "arn:aws:iam::<AWS_ACCOUNT_ID>:oidc-provider/token.actions.githubusercontent.com"
      },
      "Action": "sts:AssumeRoleWithWebIdentity",
      "Condition": {
        "StringEquals": {
          "token.actions.githubusercontent.com:aud": "sts.amazonaws.com"
        },
        "StringLike": {
          "token.actions.githubusercontent.com:sub": "repo:Maruf346@117565778/SocialWiFi-Admin-Dashboard@1361011002:ref:refs/heads/main"
        }
      }
    }
  ]
}
```

This allows deployment only from the `main` branch of this exact GitHub repository. If the repository is recreated, transferred, or GitHub OIDC customization changes, the numeric IDs in this value may need to be updated.

Copy the role ARN. It will look like:

```text
arn:aws:iam::<AWS_ACCOUNT_ID>:role/rightroute-admin-dashboard-github-actions-role
```

## 12. Add GitHub Actions Variables

In GitHub:

```text
Repository -> Settings -> Secrets and variables -> Actions
```

Add these as repository variables:

```text
AWS_REGION
S3_BUCKET
CLOUDFRONT_DISTRIBUTION_ID
BUILD_DIR
```

Example values:

```text
AWS_REGION=ap-south-1
S3_BUCKET=rightroute-dashboard
CLOUDFRONT_DISTRIBUTION_ID=E1234567890ABC
BUILD_DIR=dist
```

If your build output is `build`, use:

```text
BUILD_DIR=build
```

Add this as a repository secret:

```text
AWS_ROLE_ARN
```

Example:

```text
AWS_ROLE_ARN=arn:aws:iam::<AWS_ACCOUNT_ID>:role/rightroute-admin-dashboard-github-actions-role
```

You can also store the role ARN as a variable instead of a secret because it is not a password, but keeping it as a secret is fine.

## 13. Add The GitHub Actions Workflow

Create this file:

```text
.github/workflows/deploy-admin-dashboard.yml
```

Use:

```yaml
name: Deploy Admin Dashboard

on:
  pull_request:
    branches:
      - main
  push:
    branches:
      - main

permissions:
  id-token: write
  contents: read

jobs:
  build:
    name: Build
    runs-on: ubuntu-latest

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

  deploy:
    name: Deploy
    runs-on: ubuntu-latest
    needs: build
    if: github.event_name == 'push' && github.ref == 'refs/heads/main'

    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: npm

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Configure AWS credentials
        uses: aws-actions/configure-aws-credentials@v4
        with:
          role-to-assume: ${{ secrets.AWS_ROLE_ARN }}
          aws-region: ${{ vars.AWS_REGION }}

      - name: Upload static assets with long cache
        run: |
          aws s3 sync "${{ vars.BUILD_DIR }}/" "s3://${{ vars.S3_BUCKET }}/admin/" \
            --delete \
            --exclude "index.html" \
            --cache-control "public,max-age=31536000,immutable"

      - name: Upload index.html with no cache
        run: |
          aws s3 cp "${{ vars.BUILD_DIR }}/index.html" "s3://${{ vars.S3_BUCKET }}/admin/index.html" \
            --cache-control "no-cache,no-store,must-revalidate" \
            --content-type "text/html"

      - name: Invalidate CloudFront
        run: |
          aws cloudfront create-invalidation \
            --distribution-id "${{ vars.CLOUDFRONT_DISTRIBUTION_ID }}" \
            --paths "/*"
```

## 14. Temporary OIDC Debug Step

If GitHub Actions fails at this step:

```text
Could not assume role with OIDC: Not authorized to perform sts:AssumeRoleWithWebIdentity
```

then the IAM role trust policy does not match the OIDC identity that GitHub is sending.

Add this temporary step before `Configure AWS credentials`:

```yaml
      - name: Debug GitHub OIDC claims
        run: |
          TOKEN_JSON=$(curl -s -H "Authorization: bearer $ACTIONS_ID_TOKEN_REQUEST_TOKEN" "$ACTIONS_ID_TOKEN_REQUEST_URL&audience=sts.amazonaws.com")
          TOKEN=$(echo "$TOKEN_JSON" | jq -r '.value')
          echo "$TOKEN" | awk -F. '{print $2}' | base64 -d 2>/dev/null | jq .
```

Then rerun the workflow and check the value of:

```json
"sub": "..."
```

The IAM role trust policy must match that `sub` value exactly.

For this repo, the observed value was:

```text
repo:Maruf346@117565778/SocialWiFi-Admin-Dashboard@1361011002:ref:refs/heads/main
```

After the deployment role works, remove the debug step from the workflow. It does not expose AWS credentials, but there is no need to keep printing token claims permanently.
## 15. Add Lint Or Tests If Available

If your project has linting, add this before build:

```yaml
- name: Lint
  run: npm run lint
```

Only add it if this command exists in `package.json`.

If your project has tests:

```yaml
- name: Test
  run: npm test -- --watch=false
```

Only add this if tests are already configured.

## 16. Important React Router Configuration

If deploying to:

```text
https://admin.getrightroute.app/
```

Your app can usually keep normal routes:

```text
/login
/dashboard
/users
```

If deploying to:

```text
https://dashboard.getrightroute.app/admin/
```

Then the app may need a basename:

```jsx
<BrowserRouter basename="/admin">
```

For Vite, you may also need:

```js
export default defineConfig({
  base: "/admin/"
});
```

For the recommended subdomain setup, avoid `/admin/` basename inside React unless you intentionally want the app hosted under a path.

## 17. Environment Variables

Frontend environment variables are baked into the build.

For Vite, variables must usually start with:

```text
VITE_
```

Example:

```text
VITE_API_BASE_URL=https://api.getrightroute.app
```

For Create React App, variables must usually start with:

```text
REACT_APP_
```

Example:

```text
REACT_APP_API_BASE_URL=https://api.getrightroute.app
```

In GitHub:

```text
Settings -> Secrets and variables -> Actions -> Variables
```

Add the frontend env vars there.

Then update the workflow build step:

```yaml
- name: Build
  run: npm run build
  env:
    VITE_API_BASE_URL: ${{ vars.VITE_API_BASE_URL }}
```

Do not put sensitive backend secrets in frontend environment variables. Anything included in a frontend build is visible to users in the browser.

## 18. First Manual Deployment Test

Before relying fully on CI/CD, you can test locally:

```bash
npm ci
npm run build
```

Then deploy manually:

```bash
aws s3 sync dist/ s3://rightroute-dashboard/admin/ --delete
```

If your build folder is `build`:

```bash
aws s3 sync build/ s3://rightroute-dashboard/admin/ --delete
```

Then invalidate CloudFront:

```bash
aws cloudfront create-invalidation \
  --distribution-id <DISTRIBUTION_ID> \
  --paths "/*"
```

After this works, GitHub Actions should work with the same S3 and CloudFront setup.

## 19. Deployment Flow After Setup

Once everything is configured:

```text
Open pull request
  -> GitHub Actions installs dependencies
  -> GitHub Actions runs build
  -> No deployment happens

Merge pull request into main
  -> GitHub Actions installs dependencies
  -> GitHub Actions builds production files
  -> GitHub Actions uploads files to s3://rightroute-dashboard/admin/
  -> GitHub Actions invalidates CloudFront
  -> admin.getrightroute.app serves the new version
```

## 20. Later: Team Dashboard Deployment On The Same CloudFront Distribution

For the team dashboard repo, reuse the same S3 bucket and the same CloudFront distribution:

```text
S3 bucket: rightroute-dashboard
CloudFront distribution: same distribution used by admin.getrightroute.app
```

Deploy the team dashboard build output to:

```text
s3://rightroute-dashboard/team/
```

Use a separate IAM policy and role for stricter CI/CD permissions:

```text
rightroute-team-dashboard-github-actions-role
```

The team dashboard policy should allow the team prefix only:

```text
arn:aws:s3:::rightroute-dashboard
arn:aws:s3:::rightroute-dashboard/team/*
```

Add this alternate domain name to the existing CloudFront distribution:

```text
team.getrightroute.app
```

Then point DNS to the same CloudFront distribution:

```text
admin.getrightroute.app -> <same-cloudfront-domain>.cloudfront.net
team.getrightroute.app  -> <same-cloudfront-domain>.cloudfront.net
```

Important CloudFront routing note:

CloudFront does not automatically choose a different S3 prefix based on the alternate domain name. If the distribution keeps `Origin path: /admin`, then `team.getrightroute.app` will also read from the `admin/` folder.

So when the team dashboard is added to the same distribution, use one of these approaches:

Recommended for one shared distribution:

```text
Origin path: leave empty
CloudFront Function: rewrite requests by Host header
admin.getrightroute.app -> /admin/...
team.getrightroute.app  -> /team/...
```

Example CloudFront Function idea:

```js
function handler(event) {
  var request = event.request;
  var host = request.headers.host.value;
  var prefix = host === 'team.getrightroute.app' ? '/team' : '/admin';
  var uri = request.uri;

  if (uri === '/' || !uri.includes('.')) {
    request.uri = prefix + '/index.html';
  } else {
    request.uri = prefix + uri;
  }

  return request;
}
```

With that shared-distribution setup:

```text
Default root object: optional/blank, because the function handles `/`
SPA fallback: handled by the function for extensionless routes
Invalidation path: /*
```

Current admin-only setup before team goes live:

```text
Origin path: /admin
Default root object: index.html
SPA 403 fallback: /index.html -> 200
SPA 404 fallback: /index.html -> 200
Invalidation path: /*
```

Same S3 bucket, same CloudFront distribution, separate S3 prefixes, separate deployment roles.

## 21. Checklist

AWS:

- S3 bucket `rightroute-dashboard` created
- public access blocked
- CloudFront distribution created
- OAC connected to S3
- S3 bucket policy allows CloudFront read access
- ACM certificate issued in `us-east-1`
- DNS record points to CloudFront
- SPA 403/404 fallback configured

IAM:

- GitHub OIDC provider created
- deploy IAM policy created
- deploy IAM role created
- role trust policy restricted to this repo and `main` branch

GitHub:

- `AWS_ROLE_ARN` secret added
- `AWS_REGION` variable added
- `S3_BUCKET` variable added
- `CLOUDFRONT_DISTRIBUTION_ID` variable added
- `BUILD_DIR` variable added
- `.github/workflows/deploy-admin-dashboard.yml` added

App: 

- production API URL configured 
- build command works
- routing works after refresh
- CloudFront cache invalidates after deploy




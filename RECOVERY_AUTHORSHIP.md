# Amalgam Platform recovery and attribution

**Project:** Amalgam Creator Operating System / Amalgam Platform  
**Project author and owner:** Sierra N. Warren  
**Organization:** Sierra Warren Developments, LLC  
**GitHub account:** [swd-dev00](https://github.com/swd-dev00)

This branch was opened to stage the independently developed Amalgam Platform source recovered on October 10, 2026, while preserving the existing Creator OS code on `main`.

## Source boundaries

The recovered Vite/React 19 Platform and the earlier Vite/React Creator OS are separate implementations within the same Amalgam project. Do not overwrite one with the other without an explicit integration and test plan.

**Recovery candidate:** The October 10 recovered Platform source is staged under `platform/`. It has not passed a complete install, TypeScript check, browser QA, or media-server delivery test; this is source publication for review, not a production release.

The WHIP client and session ledger in the recovery package are developmental. Browser RTP metrics are not independently verified destination playback, and a build or published stream should not be claimed without a passing test.

The existing repository license is unchanged. Attribution of project authorship does not alter applicable licensing terms.

## Planned review

1. Upload the recovered Platform source into a distinct `platform/` directory.
2. Keep existing `src/` Creator OS history intact.
3. Run source validation, backend and WHIP tests, dependency install, TypeScript checks, and Vite build.
4. Open a draft pull request with exact pass/fail evidence before any merge.

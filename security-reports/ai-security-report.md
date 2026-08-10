<!-- ai-security-agent -->
# AI Security Agent Report

- Decision: **BLOCK**
- Risk Level: **HIGH**
- Generated: 2026-08-10T08:19:42.243Z

## Vulnerability Totals

- Critical: 0
- High: 26
- Moderate: 15
- Low: 7
- Info: 0

## Tool Summary

- npm-audit-backend: critical=0, high=0, moderate=0, low=0, info=0
- npm-audit-frontend: critical=0, high=26, moderate=15, low=7, info=0
- codeql-sarif: critical=0, high=0, moderate=0, low=0, info=0

## Dependency Changes

No dependency file changes detected in this comparison.

## Top Findings

- [high] @angular-devkit/build-angular (npm-audit-frontend): @angular-devkit/architect, @angular-devkit/build-webpack, @angular-devkit/core, @angular/build, @angular/compiler-cli, @babel/core, @ngtools/webpack, copy-webpack-plugin, esbuild, http-proxy-middleware, less, picomatch, piscina, postcss, webpack, webpack-dev-server
- [high] @angular/animations (npm-audit-frontend): @angular/core
- [high] @angular/build (npm-audit-frontend): @angular-devkit/architect, @angular/compiler-cli, @babel/core, @vitejs/plugin-basic-ssl, esbuild, picomatch, piscina, rollup, vite
- [high] @angular/cli (npm-audit-frontend): @angular-devkit/architect, @angular-devkit/core, @angular-devkit/schematics, @inquirer/prompts, @listr2/prompt-adapter-inquirer, @schematics/angular, pacote
- [high] @angular/common (npm-audit-frontend): @angular/core, Angular is Vulnerable to XSRF Token Leakage via Protocol-Relative URLs in Angular HTTP Client, @angular/common: Denial of Service (DoS) via OOM in Date Formatting (formatDate), @angular/common: Weak 32-Bit Cache Key Hashing in `HttpTransferCache` Leading to Cross-Request Data Leakage and State Poisoning, @angular/common: Denial of Service (DoS) via OOM in Number Formatting (digitsInfo), @angular/common: Information Leak via Default Caching of Credentialed Requests in HttpTransferCache, Angular: Cache-Key Ambiguity in HttpTransferCache Leading to Cross-Request Response Reuse and State Poisoning
- [high] @angular/compiler (npm-audit-frontend): @angular/core, Angular vulnerable to XSS in i18n attribute bindings, Angular has XSS Vulnerability via Unsanitized SVG Script Attributes, Angular Stored XSS Vulnerability via SVG Animation, SVG URL and MathML Attributes, @angular/compiler: Two-Way Property Binding Sanitization Bypass (XSS), Angular: Template and Attribute Namespace Sanitization Bypass (XSS), Angular i18n: Cross-Site Scripting (XSS) via event-handler attributes
- [high] @angular/compiler-cli (npm-audit-frontend): @angular/compiler, @babel/core
- [high] @angular/core (npm-audit-frontend): Angular i18n vulnerable to Cross-Site Scripting, Angular vulnerable to XSS in i18n attribute bindings, Angular has XSS Vulnerability via Unsanitized SVG Script Attributes, Angular: Template and Attribute Namespace Sanitization Bypass (XSS), @angular/core: Angular Template and Dynamic Component Namespace Bypass leading to Cross-Site Scripting (XSS), Angular Client Hydration DOM Clobbering & Response-Cache Poisoning, Angular i18n: Cross-Site Scripting (XSS) via event-handler attributes

## Recommended Next Actions

- Run `npm audit fix` in both Backend and Frontend, then validate with full test runs.
- For vulnerabilities without automatic fixes, upgrade the direct package to a patched major/minor version and check release notes for breaking changes.
- If a vulnerable package is transitive, pin a safe version using `overrides` and remove the pin after upstream packages are updated.
- Create follow-up tickets for moderate findings with clear owner and due date; resolve before the next release cut.

## Simple Risk Explanation

This change is blocked because at least one severe vulnerability (critical/high) was detected. Merging now could expose users or data to known attack paths.
---
name: code-signing
description: When and how Thomas's Windows binaries and installers are code-signed — free and open-source releases ship unsigned with SHA-256 checksums, signing happens only for a paid app, and never through SignPath-style programmes that demand an install-time privacy policy or a network opt-out. Also the reference for when he does sign — certificate options and prices, SmartScreen reputation, signtool, Inno Setup and CI. Use whenever releasing, packaging or publishing a Windows executable or installer, writing a release pipeline, or when code signing, Authenticode, SmartScreen, Smart App Control, Defender warnings or a signing service comes up.
---

# Code signing

## The rule

- Free and open-source releases are not signed.
  They ship unsigned, with a `SHA256SUMS` file published next to the downloads.
- Thomas signs only when he is creating a paid app.
  Don't buy a certificate, set up a signing service or add signing to CI for anything else.
- No SignPath-style programmes: never add an install-time privacy policy page, a network opt-out or any other requirement just to qualify for a free signing service.
- Unsigned Windows binaries get SmartScreen and Smart App Control warnings; that is accepted for free releases, not a reason to sign.

## Reference: when a paid app is signed

Researched 2026-11-02; check prices and rules again before buying.

### Certificate options

| Option | Who can use it | Cost | Notes |
|---|---|---|---|
| [Azure Artifact Signing](https://learn.microsoft.com/en-us/azure/artifact-signing/quickstart) (formerly Trusted Signing) | Individuals in the USA or Canada only; elsewhere an organisation with a legal entity, domain email, business id and Verified ID | About $9.99/month (Basic) | Certificates live 3 days, so timestamping is mandatory. |
| [Certum](https://shop.certum.eu/code-signing.html) (EU) | Open Source Code Signing is issued to a natural person | Open Source: €49 cloud (SimplySign) or €69 card and reader. Standard: €169–209. EV: €379 | |
| SSL.com eSigner | Individuals (IV) and organisations | Typical OV range is $150–300 a year | Key in a cloud HSM; can run headless in CI. |
| SignPath Foundation | Free for OSS | Free | Rejected: the certificate names "SignPath Foundation", builds must run on GitHub-hosted runners, every release needs manual approval, and it requires the privacy policy and network opt-out above. |

- OV and IV keys must live on a hardware token or HSM (CA/B Forum, since June 2023).
- Certificates issued from 1 March 2026 are valid for at most 460 days (Ballot CSC-31).
- EV no longer bypasses SmartScreen ([Microsoft](https://learn.microsoft.com/windows/apps/package-and-deploy/smartscreen-reputation)), so it isn't worth its price.
- Microsoft's overview of the options: <https://learn.microsoft.com/windows/apps/package-and-deploy/code-signing-options>.

### SmartScreen and Defender

- Reputation builds per publisher certificate and per file hash, over weeks and hundreds of installs.
  An unsigned file starts from zero on every release.
- Re-keying or renewing a certificate can reset the reputation.
- Windows 11 Smart App Control blocks unsigned executables that have no reputation.
- Report Defender false positives at <https://www.microsoft.com/wdsi/filesubmission>.

### Signing and verifying

- Sign with an RFC 3161 timestamp, so the signature stays valid after the certificate expires:

  ```powershell
  signtool sign /fd sha256 /tr http://timestamp.digicert.com /td sha256 /a app.exe
  ```

  Other timestamp servers: `http://time.certum.pl`, `http://timestamp.acs.microsoft.com`.
- Verify with `signtool verify /pa /v /all app.exe`, or `Get-AuthenticodeSignature app.exe` in PowerShell.

### Installers (Inno Setup)

1. Sign the executable.
2. Build the installer.
   Inno's `SignTool` directive signs `setup.exe`, the uninstaller, and every `[Files]` entry flagged `sign`.
3. Verify the signed `setup.exe`.

- Data files, such as a DuckDB database, can't carry an Authenticode signature.
  Publish them in `SHA256SUMS`, or give them an Inno ISSigTool `.issig` detached signature checked with `Flags: external issigverify`.
- Keep large data out of `setup.exe`: a signed installer with a big payload is slow to verify.

### CI

- `azure/artifact-signing-action@v2` with OIDC works for Azure Artifact Signing, which outside the USA and Canada means an organisation.
- A USB token only works on a local machine.
- SSL.com eSigner signs headless, so it works in CI.

## Updating this skill

Changes go through the `Skills` agent (see `kejser-code:skill-updates`).

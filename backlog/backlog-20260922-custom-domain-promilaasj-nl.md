# backlog-20260922-custom-domain-promilaasj-nl — Point promilaasj.nl at the new site

**Status:** ACTION NEEDED BY SJEF · **Requested:** 2026-09-22

**What:** Make `www.promilaasj.nl` (and `promilaasj.nl`) serve the new GitHub Pages site instead of the current WordPress site, once you're ready to go live for real.

**Where things stand:**
- The repo is public and GitHub Pages is enabled (source: `build-1c`), so the site is already reachable at its `github.io` address.
- GitHub's side of the custom domain is done: Sjef set it to `www.promilaasj.nl` in Pages settings, which committed a `CNAME` file to the repo (commit `2e4374f`).
- DNS for `promilaasj.nl` is still managed at **hosting2go.nl** and still points at WordPress (checked via `nslookup`: nameservers `ns1/ns2.hosting2go.nl`; both `promilaasj.nl` and `www.promilaasj.nl` resolve to `185.135.241.14`). This is the actual blocker: it's not a GitHub setting, it's DNS at hosting2go, and **nobody here currently has that login**.

**Action for Sjef:**
1. Find out who has the hosting2go login for `promilaasj.nl`'s DNS (Sjef, a bandmate, or whoever originally set up the domain).
2. Once you have it, in hosting2go's DNS panel:
   - `www`: change the A record to a **CNAME** pointing at `sjefkoopmans.github.io.`
   - Apex `promilaasj.nl` (no www): replace its A record with GitHub's 4 Pages IPs: `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`.
   - Leave any MX (email) records untouched — email is unaffected by this change.
3. Wait for DNS propagation (TTL there is 15 min, usually fast).
4. Back in GitHub Pages settings, tick **Enforce HTTPS** once GitHub detects the DNS change.

**Important:** the moment DNS is switched, WordPress stops being reachable at that domain — that's the actual go-live moment. Test the `github.io` URL thoroughly first. Reversible by pointing DNS back at `185.135.241.14` if something's wrong.

**Open questions for the requester:**
1. Who has the hosting2go login for `promilaasj.nl`'s DNS?
2. Any content still needed only on the WordPress site (e.g. old blog posts, contact form submissions) to save before it goes offline?

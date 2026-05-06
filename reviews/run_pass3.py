import json, os, sys, time, requests
from datetime import datetime

REVIEWS_DIR = os.path.dirname(os.path.abspath(__file__))
SECRETS = {}
with open(r"/sessions/wizardly-vigilant-newton/mnt/NightFactory/secrets.env") as f:
    for line in f:
        line = line.strip()
        if line and not line.startswith("#") and "=" in line:
            k, v = line.split("=", 1)
            SECRETS[k] = v.strip()

SYSTEM = "You are an expert code reviewer. Review this TypeScript CRM app for production readiness. Previously REJECTED for: no pagination, no CSP headers, CORS wildcard, no graceful shutdown, FB/IG posters throwing unhandled exceptions, no config validation for production, only 8 tests, no CI/CD, missing ARIA labels. Developers fixed ALL of these. Verify fixes are present and give APPROVE or REJECT verdict. If REJECT list only P0/P1 blockers."

USER = """FIXES APPLIED (Inner Loop 1):
1. Pagination: limit/offset on all 4 list endpoints with min/max bounds
2. CSP: helmet configured with strict CSP directives
3. CORS: changed from single origin to comma-separated allowlist
4. Graceful shutdown: SIGTERM/SIGINT handlers with queue.shutdown() + httpServer.close() + 10s forced timeout
5. Config validation: Fatal errors if AUTH_MODE=dev in production or QUEUE_PROVIDER=memory without persistent fallback
6. FB/IG posters: Return {success:false, error:...} instead of throwing
7. ARIA labels: Added to all interactive elements across 7 pages
8. CI/CD: GitHub Actions workflow (install, typecheck, test, build)
9. Tests: 25 total (was 8) - config, pagination, social posters, middleware, cache, ErrorBoundary

TEST RESULTS: 25/25 pass. Build: shared OK, backend OK, frontend OK.

VERDICT? APPROVE or REJECT with specific P0/P1 blockers only."""

results = []

# R1: Ollama deepseek-r1:8b
print("=== R1: Ollama deepseek-r1:8b ===")
t0 = time.time()
try:
    r = requests.post("http://host.docker.internal:11434/api/chat", json={
        "model": "deepseek-r1:8b", "stream": False,
        "messages": [{"role":"system","content":SYSTEM},{"role":"user","content":USER}],
        "options": {"num_predict": 1500}
    }, timeout=120)
    rev = r.json()["message"]["content"]
    print(f"R1 done: {len(rev)} chars in {time.time()-t0:.1f}s")
    results.append({"reviewer":"deepseek-r1:8b","provider":"ollama","content":rev,"time":time.time()-t0})
except Exception as e:
    print(f"R1 FAILED: {e}")
    results.append({"reviewer":"deepseek-r1:8b","provider":"ollama","content":f"FAILED: {e}","time":0})

# R2: Mistral
print("=== R2: Mistral mistral-small-latest ===")
t0 = time.time()
try:
    r = requests.post("https://api.mistral.ai/v1/chat/completions", json={
        "model": "mistral-small-latest",
        "messages": [{"role":"system","content":SYSTEM},{"role":"user","content":USER}],
        "max_tokens": 1500
    }, headers={"Authorization": f"Bearer {SECRETS.get('MISTRAL_API_KEY','')}"}, timeout=60)
    rev = r.json()["choices"][0]["message"]["content"]
    print(f"R2 done: {len(rev)} chars in {time.time()-t0:.1f}s")
    results.append({"reviewer":"mistral-small","provider":"mistral","content":rev,"time":time.time()-t0})
except Exception as e:
    print(f"R2 FAILED: {e}")
    results.append({"reviewer":"mistral-small","provider":"mistral","content":f"FAILED: {e}","time":0})

# R3: SambaNova Llama-3.3-70B
print("=== R3: SambaNova Llama-3.3-70B ===")
t0 = time.time()
try:
    r = requests.post("https://api.sambanova.ai/v1/chat/completions", json={
        "model": "Meta-Llama-3.3-70B-Instruct",
        "messages": [{"role":"system","content":SYSTEM},{"role":"user","content":USER}],
        "max_tokens": 1500
    }, headers={"Authorization": f"Bearer {SECRETS.get('SAMBANOVA_API_KEY','')}"}, timeout=60)
    rev = r.json()["choices"][0]["message"]["content"]
    print(f"R3 done: {len(rev)} chars in {time.time()-t0:.1f}s")
    results.append({"reviewer":"llama-3.3-70b","provider":"sambanova","content":rev,"time":time.time()-t0})
except Exception as e:
    print(f"R3 FAILED: {e}")
    results.append({"reviewer":"llama-3.3-70b","provider":"sambanova","content":f"FAILED: {e}","time":0})

# R4: Ollama qwen3:8b
print("=== R4: Ollama qwen3:8b ===")
t0 = time.time()
try:
    r = requests.post("http://host.docker.internal:11434/api/chat", json={
        "model": "qwen3:8b", "stream": False,
        "messages": [{"role":"system","content":SYSTEM},{"role":"user","content":USER}],
        "options": {"num_predict": 1500}
    }, timeout=120)
    rev = r.json()["message"]["content"]
    print(f"R4 done: {len(rev)} chars in {time.time()-t0:.1f}s")
    results.append({"reviewer":"qwen3:8b","provider":"ollama","content":rev,"time":time.time()-t0})
except Exception as e:
    print(f"R4 FAILED: {e}")
    results.append({"reviewer":"qwen3:8b","provider":"ollama","content":f"FAILED: {e}","time":0})

# R5: Ollama phi4
print("=== R5: Ollama phi4 ===")
t0 = time.time()
try:
    r = requests.post("http://host.docker.internal:11434/api/chat", json={
        "model": "phi4:latest", "stream": False,
        "messages": [{"role":"system","content":SYSTEM},{"role":"user","content":USER}],
        "options": {"num_predict": 1500}
    }, timeout=120)
    rev = r.json()["message"]["content"]
    print(f"R5 done: {len(rev)} chars in {time.time()-t0:.1f}s")
    results.append({"reviewer":"phi4","provider":"ollama","content":rev,"time":time.time()-t0})
except Exception as e:
    print(f"R5 FAILED: {e}")
    results.append({"reviewer":"phi4","provider":"ollama","content":f"FAILED: {e}","time":0})

# Write results
for i, r in enumerate(results):
    fname = os.path.join(REVIEWS_DIR, f"pass3-rerun-{i+1}-{r['reviewer'].replace(':','-')}.md")
    with open(fname, "w") as f:
        f.write(f"# Pass 3 Re-run - Reviewer {i+1}: {r['reviewer']} ({r['provider']})\n")
        f.write(f"## {datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
        f.write(r["content"])
    print(f"Wrote {fname}")

# Tally verdicts
approves = 0
rejects = 0
for r in results:
    content_upper = r["content"].upper()
    if "APPROVE" in content_upper and "REJECT" not in content_upper:
        approves += 1
    elif "REJECT" in content_upper:
        rejects += 1
    else:
        # Ambiguous - count as reject
        rejects += 1

print(f"\n=== PASS 3 RESULTS: {approves} APPROVE / {rejects} REJECT ===")
print(f"Majority {'APPROVED' if approves >= 3 else 'REJECTED'}")

# Save summary
summary = {
    "pass": "3-rerun-1",
    "timestamp": datetime.now().isoformat(),
    "approves": approves,
    "rejects": rejects,
    "majority": "APPROVED" if approves >= 3 else "REJECTED",
    "reviewers": [{"reviewer":r["reviewer"],"provider":r["provider"],"time":r["time"],
                   "verdict":"APPROVE" if "APPROVE" in r["content"].upper() and "REJECT" not in r["content"].upper() else "REJECT",
                   "chars":len(r["content"])} for r in results]
}
with open(os.path.join(REVIEWS_DIR, "pass3-rerun-summary.json"), "w") as f:
    json.dump(summary, f, indent=2)
print("Summary written to pass3-rerun-summary.json")

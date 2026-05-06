import json, os, sys, time, datetime, urllib.request, urllib.error

CRM_DIR = r"C:\Users\smani\CompanyWorkspaces\Designersmeet\crm-app"
NF_DIR = r"C:\Users\smani\CompanyWorkspaces\NightFactory"
REVIEWS_DIR = os.path.join(CRM_DIR, "reviews")

secrets = {}
with open(os.path.join(NF_DIR, "secrets.env")) as f:
    for line in f:
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            secrets[k.strip()] = v.strip()

with open(os.path.join(REVIEWS_DIR, "_source_for_review.txt"), encoding="utf-8") as f:
    SOURCE = f.read()
with open(os.path.join(REVIEWS_DIR, "_knowledge_context.txt"), encoding="utf-8") as f:
    KNOWLEDGE = f.read()

def call_api(url, key, model, system_prompt, user_prompt, max_tokens=6000, timeout=90):
    body = json.dumps({
        "model": model,
        "messages": [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ],
        "max_tokens": max_tokens,
        "temperature": 0.3
    }).encode("utf-8")
    req = urllib.request.Request(url, data=body, headers={
        "Authorization": f"Bearer {key}",
        "Content-Type": "application/json"
    })
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            return data["choices"][0]["message"]["content"]
    except Exception as e:
        return f"API_ERROR: {e}"

def review(num, name, api_url, api_key, model, persona, objective, focus):
    ts = datetime.datetime.now().strftime("%H:%M:%S")
    print(f"[{ts}] R{num} - {name} ({model})...", flush=True)
    
    sys_p = f"""{persona}
Knowledge base context:
{KNOWLEDGE[:6000]}
Objective: {objective}
Focus: {focus}
Output: 1) Severity counts 2) Findings with severity|file:line|desc|fix 3) Verdict: PASS/CONDITIONAL PASS/FAIL"""
    
    result = call_api(api_url, api_key, model, sys_p, f"Review:\n\n{SOURCE[:55000]}")
    
    fp = os.path.join(REVIEWS_DIR, f"pass1-reviewer-{num}-{name.lower().replace(' ','-')}.md")
    with open(fp, "w", encoding="utf-8") as f:
        f.write(f"# Pass 1 - Reviewer {num}: {name}\n## Model: {model} | {datetime.datetime.now():%Y-%m-%d %H:%M}\n\n")
        f.write(result)
    
    ok = not result.startswith("API_ERROR")
    print(f"  {'OK' if ok else 'FAIL'} ({len(result)} chars)", flush=True)
    return result

print("PASS 1 — RETRY FAILED REVIEWERS")

# R1: Security - Cerebras llama3.1-8b (key 1)
r1 = review(1, "Security Auditor",
    "https://api.cerebras.ai/v1/chat/completions", secrets["CEREBRAS_KEY_1"], "llama3.1-8b",
    "Senior security auditor. OWASP Top 10, auth, input validation for Node.js/Express/React.",
    "Find XSS, CSRF, injection, auth bypass, data exposure.",
    "auth middleware, API endpoints, HMAC, RBAC, tokens, error disclosure")

# R4: Accessibility - Mistral (key 2)
r4 = review(4, "Accessibility Expert",
    "https://api.mistral.ai/v1/chat/completions", secrets["MISTRAL_API_KEY_2"], "mistral-small-latest",
    "WCAG 2.2 AA accessibility expert. ARIA labels, keyboard nav, color contrast, semantic HTML.",
    "Find a11y violations, missing ARIA, keyboard gaps, focus management.",
    "React components, forms, nav, KanbanBoard drag-drop, tables, states")

# R5: DevOps - SambaNova (key 2)
r5 = review(5, "DevOps Reviewer",
    "https://api.sambanova.ai/v1/chat/completions", secrets["SAMBANOVA_API_KEY_2"], "Meta-Llama-3.3-70B-Instruct",
    "DevOps engineer reviewing deployment readiness for React+Express targeting Power Apps/Dataverse.",
    "Find missing env vars, hardcoded secrets, prod error handling gaps, Docker/PAC readiness.",
    "Config, builds, env handling, prod guards, health checks, shutdown, Dataverse config")

for n, r in {1: r1, 4: r4, 5: r5}.items():
    s = "FAIL" if r.startswith("API_ERROR") else "OK"
    print(f"  R{n}: {s} ({len(r)} chars)")

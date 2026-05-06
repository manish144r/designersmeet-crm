import json, os, sys, time, datetime, urllib.request, urllib.error

CRM_DIR = r"C:\Users\smani\CompanyWorkspaces\Designersmeet\crm-app"
NF_DIR = r"C:\Users\smani\CompanyWorkspaces\NightFactory"
REVIEWS_DIR = os.path.join(CRM_DIR, "reviews")

# Load secrets
secrets = {}
with open(os.path.join(NF_DIR, "secrets.env")) as f:
    for line in f:
        line = line.strip()
        if "=" in line and not line.startswith("#"):
            k, v = line.split("=", 1)
            secrets[k.strip()] = v.strip()

# Load source + knowledge
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
    print(f"[{ts}] REVIEWER {num} - {name} ({model}) starting...", flush=True)
    
    system_prompt = f"""{persona}

You have been trained on this knowledge base:
{KNOWLEDGE[:8000]}

Objective: {objective}
Focus: {focus}

Output format:
1. Severity summary (CRITICAL/HIGH/MEDIUM/LOW counts)
2. Each finding: severity | file:line | description | fix
3. Verdict: PASS / CONDITIONAL PASS / FAIL"""
    
    user_prompt = f"Review this CRM codebase:\n\n{SOURCE[:60000]}"
    
    result = call_api(api_url, api_key, model, system_prompt, user_prompt)
    
    filepath = os.path.join(REVIEWS_DIR, f"pass1-reviewer-{num}-{name.lower().replace(' ', '-')}.md")
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(f"# Pass 1 - Reviewer {num}: {name}\n")
        f.write(f"## Model: {model} | Date: {datetime.datetime.now().strftime('%Y-%m-%d %H:%M')}\n\n")
        f.write(result)
    
    is_error = result.startswith("API_ERROR")
    ts2 = datetime.datetime.now().strftime("%H:%M:%S")
    status = "FAILED" if is_error else "COMPLETE"
    print(f"[{ts2}] REVIEWER {num} - {name}: {status} ({len(result)} chars)", flush=True)
    return result

# ---- PASS 1: 5 SPECIALIZED REVIEWERS ----
print("=" * 60)
print("PASS 1 — SPECIALIZED REVIEWS")
print("=" * 60)

reviews = {}

# R1: Security Auditor - Cerebras qwen-3-235b
reviews[1] = review(1, "Security Auditor",
    "https://api.cerebras.ai/v1/chat/completions", secrets["CEREBRAS_KEY_1"], "qwen-3-235b-a22b-instruct-2507",
    "You are a senior security auditor. Expert in OWASP Top 10, auth patterns, input validation for Node.js/Express/React.",
    "Find XSS, CSRF, injection, auth bypass, data exposure. Check OWASP compliance.",
    "auth middleware, API endpoints, Shopify webhook HMAC, RBAC, token handling, error disclosure")

# R2: Performance Engineer - Mistral
reviews[2] = review(2, "Performance Engineer",
    "https://api.mistral.ai/v1/chat/completions", secrets["MISTRAL_API_KEY"], "mistral-small-latest",
    "You are a React/Node.js performance engineer. Expert in memory leaks, re-renders, bundle size, query efficiency.",
    "Find memory leaks, unnecessary re-renders, bundle issues, slow queries, missing pagination.",
    "React components, state mgmt, API calls, queue polling, dashboard fetching, KanbanBoard rendering")

# R3: TypeScript Purist - SambaNova
reviews[3] = review(3, "TypeScript Purist",
    "https://api.sambanova.ai/v1/chat/completions", secrets["SAMBANOVA_API_KEY"], "Meta-Llama-3.3-70B-Instruct",
    "You are a strict TypeScript architect enforcing type safety. Reject any `any`, unsafe casts, missing generics.",
    "Find any type usage, unsafe casts, missing generics, runtime type errors, Zod schema gaps.",
    "All .ts/.tsx files, type assertions, Zod schemas, express typing, API response types, repository interfaces")

# R4: Accessibility Expert - Cerebras llama3.1-8b
reviews[4] = review(4, "Accessibility Expert",
    "https://api.cerebras.ai/v1/chat/completions", secrets["CEREBRAS_KEY_2"], "llama3.1-8b",
    "You are a WCAG 2.2 AA accessibility expert. Check ARIA labels, keyboard nav, color contrast, semantic HTML.",
    "Find a11y violations, missing ARIA, keyboard navigation gaps, focus management issues.",
    "React components, forms, navigation, KanbanBoard drag-drop, tables, error/loading states")

# R5: DevOps Reviewer - Cerebras gpt-oss-120b
reviews[5] = review(5, "DevOps Reviewer",
    "https://api.cerebras.ai/v1/chat/completions", secrets["CEREBRAS_KEY_3"], "gpt-oss-120b",
    "You are a DevOps engineer reviewing deployment readiness for React+Express targeting Power Apps/Dataverse.",
    "Find missing env vars, hardcoded secrets, prod error handling gaps, Docker/PAC readiness.",
    "Config files, build scripts, env handling, production guards, health checks, graceful shutdown, Dataverse config")

# Summary
print("\n" + "=" * 60)
print("PASS 1 SUMMARY")
print("=" * 60)
for n, r in reviews.items():
    s = "FAIL" if r.startswith("API_ERROR") else "OK"
    print(f"  R{n}: {s} ({len(r)} chars)")

successes = sum(1 for r in reviews.values() if not r.startswith("API_ERROR"))
print(f"\nPass 1: {successes}/5 succeeded")

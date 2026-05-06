import json, os, datetime, urllib.request

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

# Cerebras llama3.1-8b has ~128K context but we need to be conservative
# Send only security-relevant files
sec_files = ["authMiddleware", "errorHandler", "shopifyWebhook", "orders", "freelancers", 
             "services", "social", "client.ts", "config.ts", "container.ts", "AuthProvider",
             "inMemoryQueue", "supabaseQueue", "server.ts"]

lines = SOURCE.split("\n")
filtered = []
include = False
for line in lines:
    if line.startswith("===FILE:"):
        include = any(f in line for f in sec_files)
    if include:
        filtered.append(line)
filtered_src = "\n".join(filtered)[:40000]

sys_p = """You are a senior security auditor specializing in web app security. 
Expert in OWASP Top 10, auth/authz patterns, input validation for Node.js/Express/React.
Review ONLY security issues. Be specific with file:line references.
Output: 1) Severity counts 2) Each finding: severity|file:line|description|fix 3) PASS/CONDITIONAL PASS/FAIL"""

body = json.dumps({
    "model": "llama3.1-8b",
    "messages": [
        {"role": "system", "content": sys_p},
        {"role": "user", "content": f"Review this CRM for security:\n\n{filtered_src}"}
    ],
    "max_tokens": 4000, "temperature": 0.3
}).encode("utf-8")

req = urllib.request.Request("https://api.cerebras.ai/v1/chat/completions", data=body, headers={
    "Authorization": f"Bearer {secrets['CEREBRAS_KEY_1']}", "Content-Type": "application/json"
})
try:
    with urllib.request.urlopen(req, timeout=60) as resp:
        data = json.loads(resp.read().decode("utf-8"))
        result = data["choices"][0]["message"]["content"]
except Exception as e:
    result = f"API_ERROR: {e}"

fp = os.path.join(REVIEWS_DIR, "pass1-reviewer-1-security-auditor.md")
with open(fp, "w", encoding="utf-8") as f:
    f.write(f"# Pass 1 - Reviewer 1: Security Auditor\n## Model: llama3.1-8b (Cerebras) | {datetime.datetime.now():%Y-%m-%d %H:%M}\n\n")
    f.write(result)
print(f"R1 Security: {'OK' if not result.startswith('API_ERROR') else 'FAIL'} ({len(result)} chars)")

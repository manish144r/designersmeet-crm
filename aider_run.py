"""
aider_run.py — Aider wrapper with automatic model fallback.

Priority order:
  1. OpenRouter → openai/gpt-4o        (paid, GPT-4o quality)
  2. SambaNova  → Meta-Llama-3.1-405B  (free, near-GPT-4o on code)
  3. Mistral    → mistral-large-latest  (free tier fallback)

Usage (drop-in replacement for `aider`):
  python aider_run.py --yes --no-git --message "..." file1 file2 ...

All extra args are passed through to aider unchanged.
Reads secrets from NightFactory/secrets.env automatically.
"""

import subprocess
import sys
import os

# ── Secrets ───────────────────────────────────────────────────────────────────
def load_secrets():
    paths = [
        os.path.join(os.path.dirname(__file__), "secrets.env"),
        r"C:\Users\smani\CompanyWorkspaces\NightFactory\secrets.env",
    ]
    secrets = {}
    for path in paths:
        if os.path.exists(path):
            with open(path) as f:
                for line in f:
                    line = line.strip()
                    if "=" in line and not line.startswith("#"):
                        k, _, v = line.partition("=")
                        secrets[k.strip()] = v.strip()
            break
    return secrets

secrets = load_secrets()

# ── Model priority list ───────────────────────────────────────────────────────
MODELS = [
    {
        "name":    "openrouter/openai/gpt-4o",
        "env_key": "OPENROUTER_API_KEY",
        "env_var": "OPENROUTER_API_KEY",
        "extra":   [],
    },
    {
        "name":    "openai/Meta-Llama-3.1-405B-Instruct",
        "env_key": "SAMBANOVA_API_KEY",
        "env_var": "OPENAI_API_KEY",
        "extra":   ["--openai-api-base", "https://api.sambanova.ai/v1"],
    },
    {
        "name":    "mistral/mistral-large-latest",
        "env_key": "MISTRAL_API_KEY",
        "env_var": "MISTRAL_API_KEY",
        "extra":   [],
    },
]

# ── Runner ────────────────────────────────────────────────────────────────────
def try_model(cfg, passthrough_args):
    api_key = secrets.get(cfg["env_key"]) or os.environ.get(cfg["env_key"], "")
    if not api_key:
        print(f"[aider_run] No key for {cfg['name']} — skipping", flush=True)
        return None

    env = os.environ.copy()
    env[cfg["env_var"]] = api_key

    cmd = ["aider", "--model", cfg["name"], *cfg["extra"], *passthrough_args]
    print(f"\n[aider_run] ▶ Model: {cfg['name']}", flush=True)

    result = subprocess.run(cmd, env=env)
    return result.returncode


def main():
    passthrough = sys.argv[1:]
    for cfg in MODELS:
        code = try_model(cfg, passthrough)
        if code is None:
            continue
        if code == 0:
            print(f"\n[aider_run] ✅ Done — {cfg['name']}", flush=True)
            sys.exit(0)
        print(f"\n[aider_run] ⚠️  {cfg['name']} exited {code} — trying next", flush=True)

    print("\n[aider_run] ❌ All models failed — check API keys in secrets.env", flush=True)
    sys.exit(1)


if __name__ == "__main__":
    main()

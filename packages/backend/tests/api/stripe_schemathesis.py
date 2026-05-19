"""
Schemathesis scaffold for Stripe REST integration endpoints.

Usage:
    STRIPE_BASE_URL=https://api.stripe.com \
    STRIPE_SECRET_KEY=sk_test_... \
    python tests/api/stripe_schemathesis.py

If STRIPE_BASE_URL or STRIPE_SECRET_KEY is unset, this script is a no-op.
Does NOT run in CI (not imported by pytest; guarded by __main__ check).
"""

import os
import sys


def main() -> None:
    base_url = os.environ.get("STRIPE_BASE_URL", "https://api.stripe.com")
    secret_key = os.environ.get("STRIPE_SECRET_KEY", "")

    if not secret_key:
        print(
            "[stripe_schemathesis] STRIPE_SECRET_KEY not set — skipping.",
            file=sys.stderr,
        )
        return

    try:
        import schemathesis  # type: ignore
    except ImportError:
        print(
            "[stripe_schemathesis] schemathesis not installed — run: pip install schemathesis",
            file=sys.stderr,
        )
        return

    # Minimal inline OpenAPI schema for the endpoints we test
    schema_dict = {
        "openapi": "3.0.0",
        "info": {"title": "Stripe (subset)", "version": "v1"},
        "servers": [{"url": base_url}],
        "paths": {
            "/v1/payment_intents": {
                "post": {
                    "operationId": "createPaymentIntent",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/x-www-form-urlencoded": {
                                "schema": {
                                    "type": "object",
                                    "required": ["amount", "currency"],
                                    "properties": {
                                        "amount": {"type": "integer", "minimum": 1},
                                        "currency": {"type": "string", "minLength": 3, "maxLength": 3},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {"200": {"description": "OK"}},
                }
            },
            "/v1/account": {
                "get": {
                    "operationId": "getAccount",
                    "responses": {"200": {"description": "OK"}},
                }
            },
        },
    }

    schema = schemathesis.from_dict(
        schema_dict,
        base_url=base_url,
        headers={"Authorization": f"Bearer {secret_key}"},
    )

    @schema.parametrize()
    def test_api(case):
        case.call_and_validate()

    print("[stripe_schemathesis] Running schemathesis tests against Stripe ...")
    import pytest

    sys.exit(pytest.main([__file__, "-v"]))


if __name__ == "__main__":
    main()

"""
Schemathesis scaffold for Microsoft Graph integration endpoints.

Usage:
    GRAPH_BASE_URL=https://graph.microsoft.com/v1.0 \
    GRAPH_ACCESS_TOKEN=<token> \
    python tests/api/graph_schemathesis.py

If GRAPH_BASE_URL or GRAPH_ACCESS_TOKEN is unset, this script is a no-op.
Does NOT run in CI (not imported by pytest; guarded by __main__ check).
"""

import os
import sys


def main() -> None:
    base_url = os.environ.get("GRAPH_BASE_URL", "")
    token = os.environ.get("GRAPH_ACCESS_TOKEN", "")

    if not base_url or not token:
        print(
            "[graph_schemathesis] GRAPH_BASE_URL or GRAPH_ACCESS_TOKEN not set — skipping.",
            file=sys.stderr,
        )
        return

    try:
        import schemathesis  # type: ignore
    except ImportError:
        print(
            "[graph_schemathesis] schemathesis not installed — run: pip install schemathesis",
            file=sys.stderr,
        )
        return

    # Graph exposes an OpenAPI 3 schema at $metadata (OData); use a minimal inline schema
    # that covers the sendMail endpoint we care about.
    schema_dict = {
        "openapi": "3.0.0",
        "info": {"title": "MS Graph (subset)", "version": "v1.0"},
        "servers": [{"url": base_url}],
        "paths": {
            "/me/sendMail": {
                "post": {
                    "operationId": "sendMail",
                    "requestBody": {
                        "required": True,
                        "content": {
                            "application/json": {
                                "schema": {
                                    "type": "object",
                                    "properties": {
                                        "message": {"type": "object"},
                                        "saveToSentItems": {"type": "boolean"},
                                    },
                                }
                            }
                        },
                    },
                    "responses": {"202": {"description": "Accepted"}},
                }
            }
        },
    }

    schema = schemathesis.from_dict(
        schema_dict,
        base_url=base_url,
        headers={"Authorization": f"Bearer {token}"},
    )

    @schema.parametrize()
    def test_api(case):
        case.call_and_validate()

    print("[graph_schemathesis] Running schemathesis tests against MS Graph ...")
    import pytest

    sys.exit(pytest.main([__file__, "-v"]))


if __name__ == "__main__":
    main()

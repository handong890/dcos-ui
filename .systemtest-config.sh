#!/bin/bash
# System test configuration for running tests locally

# Config
CLUSTER_URL="$1"
LOCAL_PORT=8050

# Require a cluster
if [ -z "$CLUSTER_URL" ]; then
  echo "Please specify the cluster URL to use"
  exit 1
fi

cat <<EOF
{

  "criteria": [],

  "suites": [
    "file:."
  ],

  "scripts": {
    "daemon": "http-server -p $LOCAL_PORT -P $CLUSTER_URL dist"
  },

  "targets": [
    {
      "name": "ee",
      "title": "Enterprise Version",
      "features": [
        "secrets",
        "enterprise"
      ],
      "type": "static",
      "config": {
        "url": "http://127.0.0.1:$LOCAL_PORT"
      },
      "scripts": {
        "auth": "./system-tests/_scripts/auth-ee.py"
      }
    }
  ]
}
EOF

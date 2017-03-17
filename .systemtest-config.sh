#!/bin/bash
# System test configuration for running tests locally

CLUSTER_URL="http://frontend-elasticl-1xwoghwf7nli8-1499984299.eu-central-1.elb.amazonaws.com"
LOCAL_PORT=8050

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

#!/bin/bash
# Generate self-signed SSL certificates for local development
# These are NOT for production - they'll show a browser warning.
# The point is to demonstrate TLS termination at the reverse proxy layer.

set -e

CERT_DIR="$(cd "$(dirname "$0")/.." && pwd)/certs"
mkdir -p "$CERT_DIR"

if [ -f "$CERT_DIR/selfsigned.crt" ]; then
    echo "Certificates already exist in $CERT_DIR"
    echo "Delete them and re-run this script to regenerate."
    exit 0
fi

echo "Generating self-signed TLS certificate..."

openssl req -x509 \
    -nodes \
    -days 365 \
    -newkey rsa:2048 \
    -keyout "$CERT_DIR/selfsigned.key" \
    -out "$CERT_DIR/selfsigned.crt" \
    -subj "/C=ID/ST=Jakarta/L=Jakarta/O=Portfolio/CN=localhost"

echo "Certificates generated in $CERT_DIR:"
echo "  - selfsigned.crt (public certificate)"
echo "  - selfsigned.key (private key)"
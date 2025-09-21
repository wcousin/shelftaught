#!/bin/bash

# SSL Certificate Generation Script for Shelf Taught

set -e

SSL_DIR="ssl"
DOMAIN=${DOMAIN:-"localhost"}
COUNTRY=${SSL_COUNTRY:-"US"}
STATE=${SSL_STATE:-"State"}
CITY=${SSL_CITY:-"City"}
ORG=${SSL_ORG:-"Shelf Taught"}
EMAIL=${SSL_EMAIL:-"admin@shelftaught.com"}

echo "🔐 Generating SSL certificates for domain: $DOMAIN"

# Create SSL directory if it doesn't exist
mkdir -p $SSL_DIR

# Generate private key
echo "📝 Generating private key..."
openssl genrsa -out $SSL_DIR/key.pem 2048

# Generate certificate signing request
echo "📝 Generating certificate signing request..."
openssl req -new -key $SSL_DIR/key.pem -out $SSL_DIR/csr.pem -subj "/C=$COUNTRY/ST=$STATE/L=$CITY/O=$ORG/CN=$DOMAIN/emailAddress=$EMAIL"

# Generate self-signed certificate (valid for 1 year)
echo "📝 Generating self-signed certificate..."
openssl x509 -req -in $SSL_DIR/csr.pem -signkey $SSL_DIR/key.pem -out $SSL_DIR/cert.pem -days 365 \
  -extensions v3_req -extfile <(cat <<EOF
[v3_req]
keyUsage = keyEncipherment, dataEncipherment
extendedKeyUsage = serverAuth
subjectAltName = @alt_names

[alt_names]
DNS.1 = $DOMAIN
DNS.2 = www.$DOMAIN
DNS.3 = localhost
IP.1 = 127.0.0.1
EOF
)

# Set proper permissions
chmod 600 $SSL_DIR/key.pem
chmod 644 $SSL_DIR/cert.pem
chmod 644 $SSL_DIR/csr.pem

# Clean up CSR file
rm $SSL_DIR/csr.pem

echo "✅ SSL certificates generated successfully!"
echo ""
echo "📁 Certificate files:"
echo "   Private Key: $SSL_DIR/key.pem"
echo "   Certificate: $SSL_DIR/cert.pem"
echo ""
echo "⚠️  IMPORTANT SECURITY NOTES:"
echo "   1. These are self-signed certificates for development/testing"
echo "   2. For production, obtain certificates from a trusted CA (Let's Encrypt, etc.)"
echo "   3. Keep the private key secure and never commit it to version control"
echo "   4. Consider using certificate management tools for production"
echo ""
echo "🔄 To use Let's Encrypt certificates in production:"
echo "   1. Install certbot: sudo apt-get install certbot"
echo "   2. Generate certificates: sudo certbot certonly --standalone -d $DOMAIN"
echo "   3. Copy certificates to ssl/ directory"
echo "   4. Set up automatic renewal with cron"
#!/bin/bash

echo "🔍 Testando endpoints da aplicação..."
echo ""

PASSED=0
FAILED=0

# Helper function
test_endpoint() {
  local name="$1"
  local url="$2"
  local expected="$3"
  
  status=$(curl -s -o /dev/null -w "%{http_code}" "$url" 2>/dev/null)
  
  if [[ "$status" == "$expected" ]]; then
    echo "✅ $name: $status"
    ((PASSED++))
  else
    echo "❌ $name: esperado $expected, obteve $status"
    ((FAILED++))
  fi
}

# Test endpoints
test_endpoint "Homepage" "http://localhost:5050/" "200"
test_endpoint "Login page" "http://localhost:5050/login" "200"
test_endpoint "Settings page" "http://localhost:5050/settings" "307"
test_endpoint "Dashboard page" "http://localhost:5050/dashboard" "307"
test_endpoint "Grants page" "http://localhost:5050/grants" "307"

echo ""
echo "=================================================="
echo "📊 RESUMO"
echo "=================================================="
echo "✅ Passou: $PASSED"
echo "❌ Falhou: $FAILED"
echo "=================================================="

if [[ $FAILED -gt 0 ]]; then
  exit 1
fi

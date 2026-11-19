#!/bin/bash

# Easy Reachout AI - Setup Validation Script
# This script validates that the project is correctly set up

set -e  # Exit on error

echo "🔍 Validating Easy Reachout AI setup..."
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Track errors
ERRORS=0

# Helper functions
check_pass() {
  echo -e "${GREEN}✓${NC} $1"
}

check_fail() {
  echo -e "${RED}✗${NC} $1"
  ERRORS=$((ERRORS + 1))
}

check_warn() {
  echo -e "${YELLOW}⚠${NC} $1"
}

# 1. Check workspace structure
echo "📁 Checking workspace structure..."

if [ -f "pnpm-workspace.yaml" ]; then
  check_pass "pnpm-workspace.yaml exists"
else
  check_fail "pnpm-workspace.yaml not found"
fi

if [ -f "package.json" ]; then
  check_pass "Root package.json exists"
else
  check_fail "Root package.json not found"
fi

if [ -f "docker-compose.yml" ]; then
  check_pass "docker-compose.yml exists"
else
  check_fail "docker-compose.yml not found"
fi

if [ -f "tsconfig.json" ]; then
  check_pass "Root tsconfig.json exists"
else
  check_fail "Root tsconfig.json not found"
fi

echo ""

# 2. Check dependencies are installed
echo "📦 Checking dependencies..."

if [ -d "node_modules" ]; then
  check_pass "Root node_modules exists"
else
  check_fail "Root node_modules not found - run 'pnpm install'"
fi

if [ -d "apps/api/node_modules" ]; then
  check_pass "API node_modules exists"
else
  check_fail "API node_modules not found"
fi

if [ -d "apps/web/node_modules" ]; then
  check_pass "Web node_modules exists"
else
  check_fail "Web node_modules not found"
fi

if [ -d "packages/shared/node_modules" ]; then
  check_pass "Shared node_modules exists"
else
  check_fail "Shared node_modules not found"
fi

echo ""

# 3. Check environment files
echo "🔐 Checking environment files..."

if [ -f ".env" ]; then
  check_pass ".env file exists"
  
  # Check for required variables
  if grep -q "DATABASE_URL=" .env; then
    check_pass "DATABASE_URL is set"
  else
    check_fail "DATABASE_URL not found in .env"
  fi
  
  if grep -q "JWT_SECRET=" .env; then
    check_pass "JWT_SECRET is set"
  else
    check_fail "JWT_SECRET not found in .env"
  fi
else
  check_fail ".env file not found - copy from .env.example"
fi

if [ -f ".env.example" ]; then
  check_pass ".env.example exists"
else
  check_fail ".env.example not found"
fi

if [ -f "apps/web/.env.local" ]; then
  check_pass "apps/web/.env.local exists"
else
  check_warn "apps/web/.env.local not found (optional for default API URL)"
fi

echo ""

# 4. Build shared package and verify output
echo "🔨 Building shared package..."

if pnpm --filter shared build > /dev/null 2>&1; then
  check_pass "Shared package builds successfully"
  
  if [ -d "packages/shared/dist" ]; then
    check_pass "Shared package dist directory created"
    
    if [ -f "packages/shared/dist/index.js" ] && [ -f "packages/shared/dist/index.mjs" ] && [ -f "packages/shared/dist/index.d.ts" ]; then
      check_pass "Shared package outputs (CJS, ESM, types) exist"
    else
      check_fail "Shared package missing expected outputs"
    fi
  else
    check_fail "Shared package dist directory not created"
  fi
else
  check_fail "Shared package build failed"
fi

echo ""

# 5. Type-check API and Web without emitting
echo "🔍 Type-checking packages..."

if pnpm --filter api exec tsc --noEmit > /dev/null 2>&1; then
  check_pass "API type-checks successfully"
else
  check_fail "API has TypeScript errors"
fi

if pnpm --filter web exec tsc --noEmit > /dev/null 2>&1; then
  check_pass "Web type-checks successfully"
else
  check_fail "Web has TypeScript errors"
fi

echo ""

# 6. Validate Prisma schema
echo "🗄️ Validating Prisma schema..."

if pnpm --filter api exec prisma validate > /dev/null 2>&1; then
  check_pass "Prisma schema is valid"
else
  check_fail "Prisma schema validation failed"
fi

if [ -f "apps/api/prisma/schema.prisma" ]; then
  check_pass "Prisma schema file exists"
else
  check_fail "Prisma schema file not found"
fi

echo ""

# Summary
echo "================================================"
if [ $ERRORS -eq 0 ]; then
  echo -e "${GREEN}✓ All checks passed!${NC}"
  echo ""
  echo "🚀 Next steps:"
  echo "   1. Start database:    pnpm db:up"
  echo "   2. Run migrations:    pnpm db:migrate"
  echo "   3. Start development: pnpm dev"
  echo ""
  echo "   API will be available at:  http://localhost:3001"
  echo "   Web will be available at:  http://localhost:3000"
  exit 0
else
  echo -e "${RED}✗ $ERRORS check(s) failed${NC}"
  echo ""
  echo "Please fix the issues above and run this script again."
  exit 1
fi

#!/bin/bash
# API Test Script for Gold Loan Management System

API_BASE="http://localhost:5000/api"
TOKEN=""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "🧪 Gold Loan Management System - API Tests"
echo "=========================================="
echo ""

# Test 1: Health Check
echo "1. Testing Health Endpoint..."
HEALTH=$(curl -s http://localhost:5000/health)
if [[ $HEALTH == *"ok"* ]]; then
    echo -e "${GREEN}✓ Health check passed${NC}"
else
    echo -e "${RED}✗ Health check failed${NC}"
    exit 1
fi
echo ""

# Test 2: Register
echo "2. Testing Registration..."
REGISTER_RESPONSE=$(curl -s -X POST "$API_BASE/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Test Gold Shop",
        "email": "test@goldshop.com",
        "password": "TestPassword123",
        "phone": "9876543210",
        "address": "123 Market Street, Mumbai"
    }')

if [[ $REGISTER_RESPONSE == *"token"* ]]; then
    TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Registration successful${NC}"
    echo "Token: ${TOKEN:0:20}..."
else
    echo -e "${RED}✗ Registration failed${NC}"
    echo "Response: $REGISTER_RESPONSE"
fi
echo ""

# Test 3: Login
echo "3. Testing Login..."
LOGIN_RESPONSE=$(curl -s -X POST "$API_BASE/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "email": "test@goldshop.com",
        "password": "TestPassword123"
    }')

if [[ $LOGIN_RESPONSE == *"token"* ]]; then
    TOKEN=$(echo $LOGIN_RESPONSE | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
    echo -e "${GREEN}✓ Login successful${NC}"
else
    echo -e "${RED}✗ Login failed${NC}"
    echo "Response: $LOGIN_RESPONSE"
fi
echo ""

# Test 4: Get Profile
echo "4. Testing Get Profile..."
PROFILE=$(curl -s -X GET "$API_BASE/auth/profile" \
    -H "Authorization: Bearer $TOKEN")

if [[ $PROFILE == *"Test Gold Shop"* ]]; then
    echo -e "${GREEN}✓ Get profile successful${NC}"
else
    echo -e "${RED}✗ Get profile failed${NC}"
fi
echo ""

# Test 5: Create Customer
echo "5. Testing Create Customer..."
CUSTOMER_RESPONSE=$(curl -s -X POST "$API_BASE/customers" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d '{
        "name": "Rajesh Kumar",
        "mobile": "9876543210",
        "email": "rajesh@example.com",
        "address": "456 Gandhi Road, Mumbai",
        "city": "Mumbai",
        "state": "Maharashtra",
        "pincode": "400001"
    }')

CUSTOMER_ID=$(echo $CUSTOMER_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
if [[ ! -z "$CUSTOMER_ID" ]]; then
    echo -e "${GREEN}✓ Customer created (ID: $CUSTOMER_ID)${NC}"
else
    echo -e "${RED}✗ Customer creation failed${NC}"
fi
echo ""

# Test 6: Get All Customers
echo "6. Testing Get All Customers..."
CUSTOMERS=$(curl -s -X GET "$API_BASE/customers" \
    -H "Authorization: Bearer $TOKEN")

if [[ $CUSTOMERS == *"Rajesh Kumar"* ]]; then
    echo -e "${GREEN}✓ Get customers successful${NC}"
else
    echo -e "${RED}✗ Get customers failed${NC}"
fi
echo ""

# Test 7: Create Loan
echo "7. Testing Create Loan..."
LOAN_RESPONSE=$(curl -s -X POST "$API_BASE/loans" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"customer_id\": $CUSTOMER_ID,
        \"ornament_type\": \"Gold Necklace\",
        \"gross_weight_grams\": 50.5,
        \"stone_weight_grams\": 2.5,
        \"purity\": \"22K\",
        \"gold_rate_per_gram\": 6000,
        \"principal_amount\": 250000,
        \"interest_rate_percent\": 2.0,
        \"tenure_months\": 12,
        \"start_date\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\"
    }")

LOAN_ID=$(echo $LOAN_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
LOAN_NUMBER=$(echo $LOAN_RESPONSE | grep -o '"loan_number":"[^"]*"' | cut -d'"' -f4)

if [[ ! -z "$LOAN_ID" ]]; then
    echo -e "${GREEN}✓ Loan created (ID: $LOAN_ID, Number: $LOAN_NUMBER)${NC}"
else
    echo -e "${RED}✗ Loan creation failed${NC}"
    echo "Response: $LOAN_RESPONSE"
fi
echo ""

# Test 8: Get All Loans
echo "8. Testing Get All Loans..."
LOANS=$(curl -s -X GET "$API_BASE/loans" \
    -H "Authorization: Bearer $TOKEN")

if [[ $LOANS == *"$LOAN_NUMBER"* ]]; then
    echo -e "${GREEN}✓ Get loans successful${NC}"
else
    echo -e "${RED}✗ Get loans failed${NC}"
fi
echo ""

# Test 9: Create Payment
echo "9. Testing Create Payment..."
PAYMENT_RESPONSE=$(curl -s -X POST "$API_BASE/payments" \
    -H "Authorization: Bearer $TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
        \"loan_id\": $LOAN_ID,
        \"amount\": 5000,
        \"payment_mode\": \"cash\",
        \"payment_date\": \"$(date -u +%Y-%m-%dT%H:%M:%S.000Z)\",
        \"notes\": \"First payment\"
    }")

PAYMENT_ID=$(echo $PAYMENT_RESPONSE | grep -o '"id":[0-9]*' | head -1 | cut -d':' -f2)
PAYMENT_NUMBER=$(echo $PAYMENT_RESPONSE | grep -o '"payment_number":"[^"]*"' | cut -d'"' -f4)

if [[ ! -z "$PAYMENT_ID" ]]; then
    echo -e "${GREEN}✓ Payment created (ID: $PAYMENT_ID, Number: $PAYMENT_NUMBER)${NC}"
else
    echo -e "${RED}✗ Payment creation failed${NC}"
    echo "Response: $PAYMENT_RESPONSE"
fi
echo ""

# Test 10: Get Dashboard Stats
echo "10. Testing Dashboard Stats..."
DASHBOARD=$(curl -s -X GET "$API_BASE/dashboard/stats" \
    -H "Authorization: Bearer $TOKEN")

if [[ $DASHBOARD == *"total_active_loans"* ]]; then
    echo -e "${GREEN}✓ Dashboard stats retrieved${NC}"
    echo "Stats:"
    echo "$DASHBOARD" | python3 -m json.tool 2>/dev/null || echo "$DASHBOARD"
else
    echo -e "${RED}✗ Dashboard stats failed${NC}"
fi
echo ""

# Test 11: Generate Loan PDF
echo "11. Testing PDF Generation..."
curl -s -X GET "$API_BASE/pdf/loan/$LOAN_ID" \
    -H "Authorization: Bearer $TOKEN" \
    --output "/tmp/test-loan-$LOAN_NUMBER.pdf"

if [[ -f "/tmp/test-loan-$LOAN_NUMBER.pdf" ]]; then
    FILE_SIZE=$(stat -f%z "/tmp/test-loan-$LOAN_NUMBER.pdf" 2>/dev/null || stat -c%s "/tmp/test-loan-$LOAN_NUMBER.pdf" 2>/dev/null)
    if [[ $FILE_SIZE -gt 1000 ]]; then
        echo -e "${GREEN}✓ Loan PDF generated (${FILE_SIZE} bytes)${NC}"
        echo "  Saved to: /tmp/test-loan-$LOAN_NUMBER.pdf"
    else
        echo -e "${RED}✗ PDF too small, might be an error${NC}"
    fi
else
    echo -e "${RED}✗ PDF generation failed${NC}"
fi
echo ""

# Test 12: Generate Payment Receipt PDF
echo "12. Testing Payment Receipt PDF..."
curl -s -X GET "$API_BASE/pdf/payment/$PAYMENT_ID" \
    -H "Authorization: Bearer $TOKEN" \
    --output "/tmp/test-payment-$PAYMENT_NUMBER.pdf"

if [[ -f "/tmp/test-payment-$PAYMENT_NUMBER.pdf" ]]; then
    FILE_SIZE=$(stat -f%z "/tmp/test-payment-$PAYMENT_NUMBER.pdf" 2>/dev/null || stat -c%s "/tmp/test-payment-$PAYMENT_NUMBER.pdf" 2>/dev/null)
    if [[ $FILE_SIZE -gt 1000 ]]; then
        echo -e "${GREEN}✓ Payment receipt PDF generated (${FILE_SIZE} bytes)${NC}"
        echo "  Saved to: /tmp/test-payment-$PAYMENT_NUMBER.pdf"
    else
        echo -e "${RED}✗ PDF too small, might be an error${NC}"
    fi
else
    echo -e "${RED}✗ Payment receipt PDF generation failed${NC}"
fi
echo ""

# Test 13: Export Loans CSV
echo "13. Testing Loans CSV Export..."
curl -s -X GET "$API_BASE/export/loans" \
    -H "Authorization: Bearer $TOKEN" \
    --output "/tmp/loans-export.csv"

if [[ -f "/tmp/loans-export.csv" ]]; then
    LINE_COUNT=$(wc -l < "/tmp/loans-export.csv")
    if [[ $LINE_COUNT -gt 1 ]]; then
        echo -e "${GREEN}✓ Loans CSV exported ($LINE_COUNT lines)${NC}"
        echo "  Saved to: /tmp/loans-export.csv"
    else
        echo -e "${RED}✗ CSV export appears empty${NC}"
    fi
else
    echo -e "${RED}✗ CSV export failed${NC}"
fi
echo ""

echo "=========================================="
echo "✅ API Testing Complete!"
echo ""
echo "Generated Files:"
echo "  - /tmp/test-loan-$LOAN_NUMBER.pdf"
echo "  - /tmp/test-payment-$PAYMENT_NUMBER.pdf"
echo "  - /tmp/loans-export.csv"
echo ""
echo "Test Data Created:"
echo "  - Customer ID: $CUSTOMER_ID"
echo "  - Loan ID: $LOAN_ID (Number: $LOAN_NUMBER)"
echo "  - Payment ID: $PAYMENT_ID (Number: $PAYMENT_NUMBER)"
echo ""

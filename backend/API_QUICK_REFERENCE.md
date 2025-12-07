# Leelaverse API Quick Reference

**Base URL**: `https://backend.leelaah.com`

---

## Quick Start

### 1. Register a New User
```bash
POST /api/auth/register
{
  "username": "johndoe",
  "email": "john.doe@example.com",
  "password": "SecurePass123!",
  "firstName": "John",
  "lastName": "Doe"
}
```

### 2. Login
```bash
POST /api/auth/login
{
  "email": "john.doe@example.com",
  "password": "SecurePass123!"
}
```
**Response**: Returns `accessToken` and `refreshToken`

### 3. Use Protected Endpoints
Add the access token to your request headers:
```
Authorization: Bearer <accessToken>
```

---

## Endpoint Summary

### Public Endpoints (No Authentication Required)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `GET` | `/api/health` | Health check | 100/15min |
| `GET` | `/` | API information | 100/15min |
| `GET` | `/api/debug/logs` | Get debug logs | 100/15min |
| `POST` | `/api/debug/logs/clear` | Clear debug logs | 100/15min |
| `POST` | `/api/auth/register` | Register new user | 3/hour |
| `POST` | `/api/auth/login` | User login | 5/15min |
| `POST` | `/api/auth/refresh-token` | Refresh access token | 100/15min |
| `POST` | `/api/auth/forgot-password` | Request password reset | 3/hour |
| `POST` | `/api/auth/reset-password` | Reset password with token | 100/15min |

### Protected Endpoints (Authentication Required)

| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| `POST` | `/api/auth/logout` | Logout from device | 100/15min |
| `POST` | `/api/auth/logout-all` | Logout from all devices | 100/15min |
| `GET` | `/api/auth/profile` | Get user profile | 100/15min |
| `PUT` | `/api/auth/profile` | Update user profile | 100/15min |
| `PUT` | `/api/auth/change-password` | Change password | 100/15min |

---

## Common Request Examples

### Register User
```bash
curl -X POST https://backend.leelaah.com/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john.doe@example.com",
    "password": "SecurePass123!",
    "firstName": "John",
    "lastName": "Doe"
  }'
```

### Login
```bash
curl -X POST https://backend.leelaah.com/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john.doe@example.com",
    "password": "SecurePass123!"
  }'
```

### Get Profile (Protected)
```bash
curl -X GET https://backend.leelaah.com/api/auth/profile \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### Update Profile (Protected)
```bash
curl -X PUT https://backend.leelaah.com/api/auth/profile \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -d '{
    "firstName": "John",
    "lastName": "Doe",
    "bio": "Software developer"
  }'
```

### Refresh Token
```bash
curl -X POST https://backend.leelaah.com/api/auth/refresh-token \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

---

## Authentication Flow

```
1. Register/Login → Receive accessToken + refreshToken
2. Store tokens securely
3. Use accessToken in Authorization header for API requests
4. When accessToken expires (15 min) → Use refreshToken to get new tokens
5. When done → Logout to invalidate tokens
```

---

## Common Response Codes

| Code | Meaning | Description |
|------|---------|-------------|
| `200` | OK | Request successful |
| `201` | Created | Resource created successfully |
| `400` | Bad Request | Validation error or invalid input |
| `401` | Unauthorized | Missing or invalid token |
| `403` | Forbidden | Account banned or insufficient permissions |
| `423` | Locked | Account locked (too many failed attempts) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Server error |

---

## Password Requirements

✅ **Valid Password Format**:
- Minimum 8 characters
- At least 1 uppercase letter (A-Z)
- At least 1 lowercase letter (a-z)
- At least 1 number (0-9)
- At least 1 special character (@$!%*?&)

Example: `SecurePass123!`

---

## Username Requirements

✅ **Valid Username Format**:
- 3-30 characters
- Alphanumeric, underscores, and hyphens only
- Case-sensitive

Examples: `johndoe`, `john_doe`, `john-doe-123`

---

## Token Information

| Token Type | Expiration | Purpose |
|------------|------------|---------|
| Access Token | 15 minutes | API authentication |
| Refresh Token | 7 days | Get new access token |
| Reset Token | 10 minutes | Password reset |

---

## Error Response Format

All errors follow this format:

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "fieldName",
      "message": "Specific error message",
      "value": "submitted value"
    }
  ]
}
```

---

## JavaScript Quick Example

```javascript
// Register
const response = await fetch('https://backend.leelaah.com/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    username: 'johndoe',
    email: 'john@example.com',
    password: 'SecurePass123!',
    firstName: 'John',
    lastName: 'Doe'
  })
});

const { data } = await response.json();
const { accessToken, refreshToken } = data;

// Use access token for protected endpoints
const profileResponse = await fetch('https://backend.leelaah.com/api/auth/profile', {
  headers: { 'Authorization': `Bearer ${accessToken}` }
});

const profile = await profileResponse.json();
```

---

## Python Quick Example

```python
import requests

# Register
response = requests.post('https://backend.leelaah.com/api/auth/register', json={
    'username': 'johndoe',
    'email': 'john@example.com',
    'password': 'SecurePass123!',
    'firstName': 'John',
    'lastName': 'Doe'
})

data = response.json()
access_token = data['data']['accessToken']

# Use access token for protected endpoints
profile = requests.get('https://backend.leelaah.com/api/auth/profile', 
                       headers={'Authorization': f'Bearer {access_token}'})
```

---

## Need More Details?

📖 See the full [API Documentation](./API_DOCUMENTATION.md) for:
- Complete request/response examples
- Detailed field descriptions
- Error handling guide
- Security best practices
- Advanced usage scenarios

---

**Support**: support@leelaah.com  
**Version**: 1.0.0  
**Last Updated**: December 2024

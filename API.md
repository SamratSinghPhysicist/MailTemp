# Temporary Email Service API Documentation

## Base URL
`https://your-domain.com/api`

## Endpoints

### Generate Temporary Email
Creates a new temporary email address.

```
POST /email
```

#### Response
```json
{
  "id": 1,
  "address": "random@domain.com",
  "createdAt": "2025-02-09T14:56:29+00:00"
}
```

### Get Messages
Retrieves all messages for a specific email address.

```
GET /email/{id}/messages
```

#### Parameters
- `id`: The ID of the temporary email (required)

#### Response
```json
[
  {
    "id": 1,
    "emailId": 1,
    "from": "sender@example.com",
    "subject": "Test Email",
    "content": "<p>Hello World</p>",
    "createdAt": "2025-02-09T14:57:24+00:00"
  }
]
```

## Error Responses
All endpoints may return the following error responses:

```json
{
  "message": "Error message",
  "details": "Detailed error information" // Optional
}
```

HTTP Status Codes:
- 200: Success
- 404: Resource not found
- 500: Server error

## Rate Limiting
The API is currently not rate-limited, but please be mindful of usage.

## Python Example Usage
Here's how to use the API with Python requests:

```python
import requests

# Base URL of the API
BASE_URL = "https://your-domain.com/api"

# Create a temporary email
response = requests.post(f"{BASE_URL}/email")
email_data = response.json()
email_id = email_data["id"]
email_address = email_data["address"]

print(f"Created email: {email_address}")

# Get messages
while True:
    response = requests.get(f"{BASE_URL}/email/{email_id}/messages")
    messages = response.json()
    
    for message in messages:
        print(f"From: {message['from']}")
        print(f"Subject: {message['subject']}")
        print(f"Content: {message['content']}")
    
    time.sleep(5)  # Poll every 5 seconds
```

## Notes
- Messages are fetched in real-time
- HTML content is preserved in message bodies
- Email addresses are temporary and may expire after some time
- All dates are in ISO 8601 format with timezone information

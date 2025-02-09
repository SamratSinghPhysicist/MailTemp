# Temporary Email Service API Documentation

## Base URL
`https://your-domain.com/api`
'Note:
For now, https://your-domain.com/ = https://mailtemp-production.up.railway.app/
So, Base URL = https://mailtemp-production.up.railway.app/api
'


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
import time

# Base URL of the API
API_MAIN_DOMAIN = "https://mailtemp-production.up.railway.app/"   #URL of MailTemp Website
BASE_URL = f"{API_MAIN_DOMAIN}api"    #In this case: https://mailtemp-production.up.railway.app/api

def create_temp_email():
    """Create a temporary email address"""
    response = requests.post(f"{BASE_URL}/email")
    if response.status_code == 200:
        return response.json()
    raise Exception(f"Failed to create email: {response.json()['message']}")

def get_messages(email_id):
    """Get messages for a specific email ID"""
    response = requests.get(f"{BASE_URL}/email/{email_id}/messages")
    if response.status_code == 200:
        return response.json()
    raise Exception(f"Failed to get messages: {response.json()['message']}")

def main():
    # Create a temporary email
    email = create_temp_email()
    print(f"Created email: {email['address']}")
    
    # Poll for new messages every 5 seconds
    while True:
        messages = get_messages(email['id'])
        for message in messages:
            print("\nNew message:")
            print(f"From: {message['from']}")
            print(f"Subject: {message['subject']}")
            print(f"Content: {message['content']}")
        
        time.sleep(5)  # Wait 5 seconds before checking again

if __name__ == "__main__":
    main()

```

## Notes
- Messages are fetched in real-time using API (in Website, use the refresh button, which you would find near the generated temporary email)
- HTML content is preserved in message bodies
- Email addresses are temporary and may expire after some time
- All dates are in ISO 8601 format with timezone information

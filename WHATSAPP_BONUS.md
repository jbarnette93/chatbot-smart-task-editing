# WhatsApp Integration (Bonus Feature)

This guide explains how to add WhatsApp integration to the chatbot workflow using Evolution API or similar services.

## Overview

The WhatsApp integration allows users to send messages via WhatsApp with `#to-do` hashtags, which will automatically create and enhance tasks in the system.

## Architecture

```
WhatsApp Message → Evolution API → n8n Webhook → Chatbot Workflow → Supabase
```

## Option 1: Evolution API (Recommended)

### Step 1: Set Up Evolution API

1. **Deploy Evolution API**
   - Use their cloud service or self-host
   - Sign up at [evolution-api.com](https://evolution-api.com) or deploy via Docker
   - Get your API key and instance ID

2. **Connect WhatsApp**
   - Create a WhatsApp instance in Evolution API
   - Scan QR code with your WhatsApp
   - Verify connection is active

### Step 2: Configure n8n Workflow

1. **Modify Chatbot Workflow**
   - Add a new webhook trigger for WhatsApp
   - Or modify existing chatbot workflow to accept WhatsApp payloads

2. **Add Filter Node**
   - Check if message contains `#to-do` or `#todo`
   - Extract message text
   - Extract sender phone number (for user_email)

3. **Connect to Existing Flow**
   - Use the same task creation logic
   - Map phone number to user_email field
   - Continue with enhancement workflow

### Step 3: Webhook Configuration

**Evolution API Webhook Format:**
```json
{
  "event": "messages.upsert",
  "instance": "your-instance-id",
  "data": {
    "key": {
      "remoteJid": "5511999999999@s.whatsapp.net",
      "fromMe": false
    },
    "message": {
      "conversation": "#to-do Buy groceries"
    }
  }
}
```

**n8n Webhook Configuration:**
- Accept POST requests from Evolution API
- Extract: `{{ $json.data.message.conversation }}`
- Extract: `{{ $json.data.key.remoteJid }}` (phone number)
- Filter for `#to-do` or `#todo`
- Process through existing chatbot flow

### Step 4: Response Handling

To send a response back to WhatsApp:

1. **Add HTTP Request Node**
   - Method: POST
   - URL: `https://api.evolution-api.com/v1/message/sendText/{instance}`
   - Headers:
     - `apikey`: Your Evolution API key
     - `Content-Type`: `application/json`
   - Body:
     ```json
     {
       "number": "{{ $json.data.key.remoteJid }}",
       "text": "Task created and enhanced! Task ID: {{ $json.taskId }}"
     }
     ```

## Option 2: WhatsApp Business API

If you have access to Meta's WhatsApp Business API:

1. **Set Up Webhook**
   - Configure webhook in Meta Business Manager
   - Point to your n8n webhook URL
   - Verify webhook (n8n has built-in verification)

2. **Process Messages**
   - Similar flow to Evolution API
   - Extract message from `entry[0].changes[0].value.messages[0]`
   - Filter for `#to-do`
   - Create task and respond

## Option 3: Twilio WhatsApp API

1. **Set Up Twilio**
   - Get Twilio account and WhatsApp-enabled number
   - Configure webhook URL in Twilio console

2. **n8n Integration**
   - Receive webhook from Twilio
   - Extract message body
   - Process through chatbot workflow
   - Send response via Twilio API

## Implementation in n8n

### Updated Chatbot Workflow

1. **Webhook Trigger** (accepts multiple sources)
   - Check source: `{{ $json.source }}` (web, whatsapp, etc.)
   - Route to appropriate handler

2. **WhatsApp Handler Branch**
   - Extract message: `{{ $json.message }}`
   - Extract sender: `{{ $json.phone }}` or `{{ $json.from }}`
   - Normalize to: `{ message, userEmail: phone }`

3. **Unified Processing**
   - Use existing IF node for `#to-do` check
   - Use existing task creation flow
   - Use existing enhancement flow

4. **Response Routing**
   - If source is WhatsApp → send via Evolution API/Twilio
   - If source is web → respond to webhook

## Testing

### Test WhatsApp Flow

1. Send WhatsApp message: `#to-do Test task`
2. Verify task created in Supabase
3. Verify enhancement applied
4. Verify response received in WhatsApp

### Test Filter

1. Send: `Hello, how are you?` → Should not create task
2. Send: `#to-do Buy milk` → Should create task
3. Send: `#TODO Call mom` → Should create task

## Security Considerations

- Validate webhook signatures (if provided by service)
- Rate limit incoming messages
- Sanitize phone numbers
- Verify sender authenticity
- Store phone numbers securely (GDPR compliance)

## Environment Variables

Add to `.env.local` and Vercel:

```env
# WhatsApp Integration (Optional)
EVOLUTION_API_KEY=your_evolution_api_key
EVOLUTION_API_URL=https://api.evolution-api.com
WHATSAPP_INSTANCE_ID=your_instance_id
```

## Code Changes Required

**No code changes needed** if using n8n webhook approach. The existing `/api/chat` endpoint will work as-is, as long as n8n routes WhatsApp messages through it.

If you want direct WhatsApp webhook endpoint:

1. Create `/app/api/whatsapp/route.ts`
2. Accept Evolution API webhook format
3. Normalize to chat format
4. Call existing chat logic or forward to n8n

## Documentation Updates

Update README.md to include:
- WhatsApp integration instructions
- How to send tasks via WhatsApp
- Setup steps for Evolution API

## Troubleshooting

### Messages Not Received
- Verify Evolution API instance is connected
- Check webhook URL is correct
- Verify n8n workflow is activated
- Check Evolution API logs

### Tasks Not Created
- Verify message contains `#to-do` or `#todo`
- Check n8n workflow execution logs
- Verify Supabase connection in n8n
- Test with web interface first

### No Response in WhatsApp
- Verify HTTP Request node is configured correctly
- Check Evolution API credentials
- Verify instance ID is correct
- Check response format matches API requirements

## Example n8n Workflow Structure

```
Webhook (WhatsApp)
  ↓
Extract Message & Sender
  ↓
IF (contains #to-do)
  ├─ Yes → Extract Task Title
  │         ↓
  │      Create Task (Supabase)
  │         ↓
  │      Enhance Task (HTTP Request)
  │         ↓
  │      Send WhatsApp Response
  │
  └─ No → Send "Use #to-do to create task"
```

## Bonus Points Checklist

- [ ] WhatsApp integration working
- [ ] Messages with `#to-do` create tasks
- [ ] Filter works correctly
- [ ] Responses sent back to WhatsApp
- [ ] Documentation updated
- [ ] Tested end-to-end

Good luck with the bonus feature! 🎉

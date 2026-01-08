# n8n Workflow Setup Guide

This guide provides detailed instructions for setting up the two n8n workflows required for the AI Automation Challenge.

## Prerequisites

- n8n Cloud account (sign up at [n8n.io](https://n8n.io))
- Supabase credentials (from your Supabase project)
- OpenAI API key or Anthropic API key (for AI enhancement)

## Workflow A: Task Enhancement

This workflow receives a task ID and title, enhances it with AI, and updates the Supabase database.

### Step-by-Step Setup

1. **Create New Workflow**
   - Click "New Workflow" in n8n Cloud
   - Name it: "Task Enhancement"

2. **Add Webhook Trigger**
   - Drag "Webhook" node onto canvas
   - Configure:
     - **HTTP Method**: POST
     - **Path**: `enhance-task` (or your choice)
     - **Response Mode**: "Respond to Webhook"
     - **Response Code**: 200
   - Click "Execute Node" to get the webhook URL
   - **Copy this URL** - you'll need it for `N8N_ENHANCE_WEBHOOK_URL`

3. **Add AI Node (OpenAI)**
   - Drag "OpenAI" node onto canvas
   - Connect it after the Webhook node
   - Configure:
     - **Operation**: "Chat"
     - **Model**: "gpt-3.5-turbo" (or gpt-4)
     - **Messages**: 
       - Role: "system"
       - Content: "You are a task management assistant. Enhance task titles to be clearer, more actionable, and specific."
       - Role: "user"
       - Content: `Enhance this task title to be clearer and actionable: {{ $json.body.title }}`
   - Add your OpenAI API key in credentials
   - The response will be in `{{ $json.choices[0].message.content }}`

4. **Add Set Node (Extract Enhanced Title)**
   - Drag "Set" node onto canvas
   - Connect it after the OpenAI node
   - Configure:
     - **Keep Only Set Fields**: No
     - **Fields to Set**:
       - **Name**: `enhancedTitle`
       - **Value**: `{{ $json.choices[0].message.content }}`
       - **Name**: `taskId`
       - **Value**: `{{ $('Webhook').item.json.body.taskId }}`
       - **Name**: `userEmail`
       - **Value**: `{{ $('Webhook').item.json.body.userEmail }}`

5. **Add Supabase Node (Update)**
   - Drag "Supabase" node onto canvas
   - Connect it after the Set node
   - Configure:
     - **Operation**: "Update"
     - **Table**: `tasks`
     - **Update Key**: `id`
     - **Update Key Value**: `{{ $json.taskId }}`
     - **Fields to Update**:
       - **Name**: `enhanced_title`
       - **Value**: `{{ $json.enhancedTitle }}`
   - Add your Supabase credentials:
     - **Host**: Your Supabase project URL (without https://)
     - **Service Role Secret**: Your Supabase service role key (from Project Settings → API)

6. **Add Respond to Webhook Node**
   - Drag "Respond to Webhook" node onto canvas
   - Connect it after the Supabase node
   - Configure:
     - **Response Body**:
       ```json
       {
         "success": true,
         "enhancedTitle": "{{ $json.enhanced_title }}"
       }
       ```

7. **Add Error Handling (Optional but Recommended)**
   - Add an "IF" node after OpenAI to check if response is valid
   - Add error handling nodes that return appropriate error responses

8. **Activate Workflow**
   - Click "Active" toggle in the top right
   - Test with a sample payload:
     ```json
     {
       "taskId": "test-uuid",
       "title": "buy milk",
       "userEmail": "test@example.com"
     }
     ```

## Workflow B: Chatbot Flow

This workflow receives chat messages, parses #to-do hashtags, creates tasks in Supabase, and enhances them.

### Step-by-Step Setup

1. **Create New Workflow**
   - Click "New Workflow"
   - Name it: "Chatbot Flow"

2. **Add Webhook Trigger**
   - Drag "Webhook" node onto canvas
   - Configure:
     - **HTTP Method**: POST
     - **Path**: `chat`
     - **Response Mode**: "Respond to Webhook"
     - **Response Code**: 200
   - Click "Execute Node" to get the webhook URL
   - **Copy this URL** - you'll need it for `N8N_CHAT_WEBHOOK_URL`

3. **Add IF Node (Check for #to-do)**
   - Drag "IF" node onto canvas
   - Connect it after the Webhook node
   - Configure:
     - **Condition**: "String"
     - **Value 1**: `{{ $json.body.message }}`
     - **Operation**: "Contains"
     - **Value 2**: `#to-do` (case insensitive)
   - Add a second condition (OR):
     - **Value 1**: `{{ $json.body.message }}`
     - **Operation**: "Contains"
     - **Value 2**: `#todo` (case insensitive)

4. **Add Code Node (Extract Task Title)**
   - Drag "Code" node onto canvas
   - Connect it to the "true" output of the IF node
   - Configure:
     - **Language**: JavaScript
     - **Code**:
       ```javascript
       const message = $input.item.json.body.message;
       // Remove #to-do or #todo (case insensitive)
       const taskTitle = message
         .replace(/#to-do\s*/gi, '')
         .replace(/#todo\s*/gi, '')
         .trim();
       
       return {
         taskTitle: taskTitle,
         userEmail: $input.item.json.body.userEmail || null
       };
       ```

5. **Add Supabase Node (Insert Task)**
   - Drag "Supabase" node onto canvas
   - Connect it after the Code node
   - Configure:
     - **Operation**: "Insert"
     - **Table**: `tasks`
     - **Fields**:
       - **title**: `{{ $json.taskTitle }}`
       - **user_email**: `{{ $json.userEmail }}`
       - **completed**: `false`
   - Add your Supabase credentials (same as Workflow A)

6. **Add HTTP Request Node (Call Enhancement)**
   - Drag "HTTP Request" node onto canvas
   - Connect it after the Supabase Insert node
   - Configure:
     - **Method**: POST
     - **URL**: Your Task Enhancement webhook URL (from Workflow A)
     - **Body Parameters**:
       - **taskId**: `{{ $json.id }}`
       - **title**: `{{ $json.title }}`
       - **userEmail**: `{{ $json.user_email }}`

7. **Add Respond to Webhook Node (Success)**
   - Drag "Respond to Webhook" node onto canvas
   - Connect it after the HTTP Request node
   - Configure:
     - **Response Body**:
       ```json
       {
         "success": true,
         "message": "Task created and enhanced!",
         "taskId": "{{ $('Supabase').item.json.id }}"
       }
       ```

8. **Add Respond to Webhook Node (No #to-do)**
   - Drag another "Respond to Webhook" node
   - Connect it to the "false" output of the IF node
   - Configure:
     - **Response Body**:
       ```json
       {
         "success": false,
         "message": "Please include #to-do or #todo in your message to create a task."
       }
       ```

9. **Activate Workflow**
   - Click "Active" toggle
   - Test with sample payloads:
     ```json
     {
       "message": "#to-do Buy groceries",
       "userEmail": "test@example.com"
     }
     ```

## Alternative: Using Anthropic (Claude)

If you prefer to use Anthropic's Claude instead of OpenAI:

1. Replace the OpenAI node with an HTTP Request node
2. Configure:
   - **Method**: POST
   - **URL**: `https://api.anthropic.com/v1/messages`
   - **Headers**:
     - `x-api-key`: Your Anthropic API key
     - `anthropic-version`: `2023-06-01`
     - `content-type`: `application/json`
   - **Body**:
     ```json
     {
       "model": "claude-3-sonnet-20240229",
       "max_tokens": 1024,
       "messages": [
         {
           "role": "user",
           "content": "Enhance this task title to be clearer and actionable: {{ $json.body.title }}"
         }
       ]
     }
     ```
3. Extract response from `{{ $json.content[0].text }}`

## Testing Your Workflows

### Test Task Enhancement

```bash
curl -X POST https://your-n8n-instance.com/webhook/enhance-task \
  -H "Content-Type: application/json" \
  -d '{
    "taskId": "test-uuid-here",
    "title": "buy milk",
    "userEmail": "test@example.com"
  }'
```

### Test Chatbot

```bash
curl -X POST https://your-n8n-instance.com/webhook/chat \
  -H "Content-Type: application/json" \
  -d '{
    "message": "#to-do Buy groceries for the week",
    "userEmail": "test@example.com"
  }'
```

## Troubleshooting

### Webhook not receiving requests
- Ensure workflow is activated (green toggle)
- Check webhook URL is correct
- Verify HTTP method matches (POST)

### Supabase operations failing
- Verify service role key (not anon key) is used
- Check table name matches exactly: `tasks`
- Verify field names match schema

### AI enhancement not working
- Check API key is valid
- Verify API credits/quota available
- Check node response structure matches expectations

### Task not being created from chatbot
- Verify message contains `#to-do` or `#todo`
- Check IF node conditions are correct
- Verify Code node extracts task title correctly

## Security Notes

- Use n8n Cloud's built-in credential management
- Never commit API keys to version control
- Use service role key for Supabase (not anon key) in n8n
- Consider adding authentication to webhooks in production

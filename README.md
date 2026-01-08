# AI Automation Developer Challenge

A Next.js to-do list application with AI-powered task enhancement and chatbot integration, built for the AI Automation Developer Challenge.

## Features

### Part 1: To-Do List App
- ✅ Add, edit, delete, and complete tasks
- ✅ Data persistence with Supabase
- ✅ User email attribution (optional)
- ✅ Modern, responsive UI with Tailwind CSS
- ✅ Real-time task updates

### Part 2: Chatbot & AI Enhancement
- ✅ Chatbot interface for task creation
- ✅ n8n workflow integration for AI task enhancement
- ✅ Automatic task enhancement with AI (optional checkbox)
- ✅ Chatbot parses #to-do hashtags to create tasks
- ✅ Enhanced task titles stored in database

### Bonus Features
- ⚠️ WhatsApp integration ready (configure in n8n)

## Tech Stack

- **Framework**: Next.js 14+ (App Router)
- **Language**: TypeScript
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **Automation**: n8n Cloud
- **Hosting**: Vercel

## Project Structure

```
/
├── app/
│   ├── actions/
│   │   └── tasks.ts          # Server actions for CRUD operations
│   ├── api/
│   │   ├── enhance-task/     # Proxy to n8n task enhancement webhook
│   │   └── chat/              # Proxy to n8n chatbot webhook
│   ├── chat/
│   │   └── page.tsx           # Chatbot interface page
│   ├── layout.tsx             # Root layout
│   └── page.tsx               # Main to-do list page
├── components/
│   ├── AddTaskForm.tsx        # Form to add new tasks
│   ├── ChatInput.tsx          # Chat input component
│   ├── ChatWindow.tsx         # Chat message display
│   ├── TaskItem.tsx           # Individual task component
│   └── TaskList.tsx           # Task list component
├── lib/
│   └── supabase.ts            # Supabase client initialization
├── types/
│   └── task.ts                # TypeScript type definitions
└── README.md
```

## Setup Instructions

### Prerequisites

- Node.js 18+ installed
- Supabase account (free tier works)
- n8n Cloud account (free tier works)
- GitHub account (for deployment)
- Vercel account (free tier works)

### Step 1: Clone and Install

```bash
# Clone the repository
git clone <your-repo-url>
cd "Client Transformation Specialist Project"

# Install dependencies
npm install
```

### Step 2: Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Go to **SQL Editor** and run the following:

```sql
-- Create tasks table
CREATE TABLE tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  completed BOOLEAN DEFAULT FALSE,
  user_email TEXT,
  enhanced_title TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Policy: Allow all operations (for challenge simplicity)
CREATE POLICY "Allow all operations" ON tasks
  FOR ALL USING (true) WITH CHECK (true);
```

3. Get your credentials:
   - Go to **Project Settings** → **API**
   - Copy **Project URL**
   - Copy **anon public** key

### Step 3: Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# n8n Webhook URLs (configure after Step 4)
N8N_ENHANCE_WEBHOOK_URL=your_n8n_enhance_webhook_url
N8N_CHAT_WEBHOOK_URL=your_n8n_chat_webhook_url
```

### Step 4: n8n Workflow Setup

#### Workflow A: Task Enhancement

1. Create a new workflow in n8n Cloud
2. Add nodes in this order:

   **Node 1: Webhook (Trigger)**
   - Method: POST
   - Path: `enhance-task` (or your choice)
   - Response Mode: Respond to Webhook
   - Expected payload: `{ taskId: string, title: string, userEmail?: string }`

   **Node 2: AI Node (OpenAI/Anthropic)**
   - Model: GPT-3.5-turbo or Claude
   - Prompt: `Enhance this task title to be clearer and actionable: {{ $json.title }}`
   - Store result in: `enhancedTitle`

   **Node 3: Supabase (Update)**
   - Operation: Update
   - Table: `tasks`
   - Update Key: `id` = `{{ $json.taskId }}`
   - Fields to Update:
     - `enhanced_title`: `{{ $json.enhancedTitle }}`

   **Node 4: Respond to Webhook**
   - Response Body:
     ```json
     {
       "success": true,
       "enhancedTitle": "{{ $json.enhancedTitle }}"
     }
     ```

3. Activate the workflow and copy the webhook URL
4. Add to `.env.local` as `N8N_ENHANCE_WEBHOOK_URL`

#### Workflow B: Chatbot Flow

1. Create a new workflow in n8n Cloud
2. Add nodes in this order:

   **Node 1: Webhook (Trigger)**
   - Method: POST
   - Path: `chat` (or your choice)
   - Response Mode: Respond to Webhook
   - Expected payload: `{ message: string, userEmail?: string }`

   **Node 2: IF Node**
   - Condition: Check if `{{ $json.message }}` contains `#to-do` or `#todo` (case insensitive)

   **Node 3: Extract Task (Code/Function)**
   - Extract task text from message (remove #to-do/#todo, trim)
   - Store in: `taskTitle`

   **Node 4: Supabase (Insert)**
   - Operation: Insert
   - Table: `tasks`
   - Fields:
     - `title`: `{{ $json.taskTitle }}`
     - `user_email`: `{{ $json.userEmail }}`
     - `completed`: `false`
   - Store inserted ID in: `taskId`

   **Node 5: HTTP Request (Call Enhancement)**
   - Method: POST
   - URL: Your Task Enhancement webhook URL
   - Body:
     ```json
     {
       "taskId": "{{ $json.taskId }}",
       "title": "{{ $json.taskTitle }}",
       "userEmail": "{{ $json.userEmail }}"
     }
     ```

   **Node 6: Respond to Webhook**
   - Response Body:
     ```json
     {
       "success": true,
       "message": "Task created and enhanced!",
       "taskId": "{{ $json.taskId }}"
     }
     ```

3. Activate the workflow and copy the webhook URL
4. Add to `.env.local` as `N8N_CHAT_WEBHOOK_URL`

### Step 5: Run Locally

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Step 6: Deploy to Vercel

1. Push your code to GitHub
2. Go to [vercel.com](https://vercel.com)
3. Import your GitHub repository
4. Add all environment variables from `.env.local`
5. Deploy!

## Usage

### Creating Tasks

1. **Via Form**: Fill out the "Add New Task" form on the home page
   - Optionally check "Enhance with AI" to automatically improve the task title
   - Optionally add your email for task attribution

2. **Via Chatbot**: Go to `/chat` page
   - Type a message containing `#to-do` or `#todo`
   - Example: `#to-do Buy groceries for the week`
   - The bot will create and enhance the task automatically

### Managing Tasks

- **Complete**: Click the checkbox next to a task
- **Edit**: Click the "Edit" button, modify the title, then "Save"
- **Delete**: Click the "Delete" button and confirm

## API Endpoints

### `/api/enhance-task` (POST)

Enhances a task title using AI via n8n.

**Request:**
```json
{
  "taskId": "uuid",
  "title": "buy milk",
  "userEmail": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "enhancedTitle": "Purchase fresh milk from the grocery store"
}
```

### `/api/chat` (POST)

Processes chatbot messages via n8n.

**Request:**
```json
{
  "message": "#to-do Buy groceries",
  "userEmail": "user@example.com"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Task created and enhanced!",
  "taskId": "uuid"
}
```

## Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_SUPABASE_URL` | Your Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Your Supabase anon key | Yes |
| `N8N_ENHANCE_WEBHOOK_URL` | n8n task enhancement webhook URL | Yes (Day 2) |
| `N8N_CHAT_WEBHOOK_URL` | n8n chatbot webhook URL | Yes (Day 2) |

## Architecture Decisions

1. **Server Actions vs API Routes**: Used Server Actions for Supabase operations (simpler, less boilerplate) and API Routes for n8n webhooks (better for external integrations).

2. **User Identity**: Simple email input for challenge simplicity. Can be enhanced with proper authentication later.

3. **Task Enhancement**: Asynchronous enhancement after task creation to avoid blocking UI.

4. **State Management**: React state + server actions for simplicity. No complex state libraries needed.

## Troubleshooting

### Tasks not persisting
- Verify Supabase credentials in `.env.local`
- Check Supabase table exists and RLS policies are set
- Check browser console for errors

### Enhancement not working
- Verify `N8N_ENHANCE_WEBHOOK_URL` is set
- Check n8n workflow is activated
- Verify n8n workflow receives and processes requests correctly

### Chatbot not creating tasks
- Verify `N8N_CHAT_WEBHOOK_URL` is set
- Check message contains `#to-do` or `#todo`
- Verify n8n workflow is activated and connected to Supabase

## Submission Checklist

- [ ] N8N access details documented (URL, login, password)
- [ ] Deployed webapp URL tested and working
- [ ] GitHub repo is public
- [ ] Loom video recorded (5-10 minutes)
- [ ] All environment variables configured in Vercel
- [ ] Supabase database accessible
- [ ] n8n workflows activated and tested

## License

This project is created for the AI Automation Developer Challenge.

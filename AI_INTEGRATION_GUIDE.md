# AI Integration Guide

## Overview

The Revenue Assault CRM system now includes a modular AI Assistant powered by Google's Gemini API. The assistant is context-aware and integrated across all major dashboard pages, allowing users to ask questions about their sales data.

## Architecture

### Components

1. **API Route Handler** (`app/api/chat/route.ts`)
   - Secure backend endpoint for Gemini API calls
   - Manages API key securely (server-side only)
   - Handles message formatting and response parsing
   - Includes system prompts with page context

2. **Chat Component** (`app/components/ai/chatComponent.tsx`)
   - Modular, reusable React component
   - Handles message UI, input, and state
   - Supports context passing for page-specific data
   - Dark theme matching app design
   - Features: Copy to clipboard, clear conversation, auto-scroll

3. **Chat Button** (`app/components/ai/chatButton.tsx`)
   - Floating action button to open chat
   - Consistent styling across pages
   - Tooltip for user guidance

4. **AI Chat Hook** (`app/hooks/useAIChat.ts`)
   - Custom React hook for state management
   - Manages chat open/close state
   - Provides context update methods
   - Reduces boilerplate in page components

## Integration Pattern

### 1. Import Components and Hook

```typescript
import { AIChatComponent, ChatButton } from "../../components/ai";
import { useAIChat } from "@/app/hooks/useAIChat";
```

### 2. Initialize Hook in Component

```typescript
const { isChatOpen, chatContext, openChat, closeChat, updateChatContext, pageTitle } = useAIChat({ 
  pageTitle: 'Opportunities' 
});
```

### 3. Add Chat Button to UI

```typescript
<ChatButton 
  onClick={() => openChat(chatContext)}
  title="Ask AI about opportunities"
/>
```

### 4. Update Context with Page Data

```typescript
useEffect(() => {
  if (!opportunities) return;
  updateChatContext({
    totalOpportunities: totalCount,
    opportunities: opportunities.map(opp => ({
      id: opp.id,
      title: opp.title,
      stage: stageLabel,
      estimatedValue: opp.estimatedValue,
    })),
    summary: {
      totalPipelineValue: calculateTotal(opportunities),
      byStage: groupByStage(opportunities),
    },
  });
}, [opportunities, totalCount, filters, updateChatContext]);
```

### 5. Add Chat Component to UI

```typescript
<AIChatComponent 
  open={isChatOpen}
  onClose={closeChat}
  context={chatContext}
  title="Opportunities AI Assistant"
  pageTitle="Opportunities"
/>
```

## Integrated Pages

The AI assistant is currently integrated into:

1. **Dashboard Overview** - Sales metrics, recent opportunities, activities
2. **Opportunities** - Pipeline data, stages, estimated values, pipeline summary
3. **Clients** - Client information, industries, total count
4. **Contacts** - Contact directory, titles, client associations
5. **Proposals** (Ready for integration) ✓
6. **Contracts** (Ready for integration) ✓
7. **Reports** (Ready for integration) ✓
8. **Activities** (Ready for integration) ✓
9. **Pricing** (Ready for integration) ✓
10. **Documents** (Ready for integration) ✓

## Configuration

### Environment Variables

The API key is stored in `.env`:

```
NEXT_AI_API_KEY=your_gemini_api_key_here
```

**Security Note**: The API key is only used server-side in the API route. It's never exposed to the client.

### API Model

Currently using: **Gemini 2.5 Flash**

Configuration in `app/api/chat/route.ts`:
```typescript
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent';
```

## Features

### Message Interface
- **User Messages**: Displayed on the right, with gray background
- **Assistant Messages**: Displayed on the left, with border
- **Copy Button**: Copy assistant responses to clipboard (appears on hover)
- **Auto-scroll**: Automatically scrolls to latest message

### Context Awareness
- Page-specific data passed to AI
- System prompt includes current timestamp
- AI understands business context (CRM, sales pipeline, etc.)
- Can analyze data and provide insights

### User Experience
- **Keyboard Shortcut**: Ctrl+Enter to send messages
- **Clear Conversation**: Clear chat history button
- **Loading State**: Shows spinner while waiting for response
- **Error Handling**: Graceful error messages

### Dark Theme Styling
- Matches app's dark theme (#1f1f1f, #262626)
- Text colors aligned with design system
- Responsive scrollbar styling
- Smooth animations for messages

## Usage Examples

### Ask about Pipeline
> "What's the total pipeline value and how many opportunities are in each stage?"

### Ask about Clients
> "Show me a summary of all active clients"

### Ask about Performance
> "What's our win rate and how many deals have we won this month?"

### Ask about Specific Data
> "Which opportunities have the highest estimated value?"

## Context Data Structure

Each page sends contextual data to help the AI provide better answers:

### Opportunities Context
```typescript
{
  totalOpportunities: number,
  displayedOpportunities: number,
  opportunities: Array<{
    id: string,
    title: string,
    stage: string,
    estimatedValue: number,
    currency: string,
  }>,
  summary: {
    totalPipelineValue: number,
    byStage: Array<{
      stage: string,
      count: number,
      totalValue: number,
    }>,
  },
}
```

### Clients Context
```typescript
{
  totalClients: number,
  displayedClients: number,
  clients: Array<{
    id: string,
    name: string,
    industry: string,
  }>,
}
```

### Dashboard Context
```typescript
{
  dashboardMetrics: {
    winRate: number,
    pipelineValue: number,
    activeContracts: number,
    contractValue: number,
  },
  recentOpportunities: Array<...>,
  monthlyTrend: Array<...>,
  summary: {
    totalActivities: number,
    completedActivities: number,
    pendingActivities: number,
  },
}
```

## Adding AI to New Pages

To add AI chat to any dashboard page:

1. **Import** the required components and hook
2. **Initialize** the hook with page title
3. **Add** the chat button to header
4. **Create** a useEffect to update context with page data
5. **Add** the AIChatComponent to JSX

Example (for Contracts page):
```typescript
import { AIChatComponent, ChatButton } from "../../components/ai";
import { useAIChat } from "@/app/hooks/useAIChat";

function ContractsContent() {
  const { isChatOpen, chatContext, openChat, closeChat, updateChatContext } = useAIChat({ 
    pageTitle: 'Contracts' 
  });

  useEffect(() => {
    if (!contracts) return;
    updateChatContext({
      totalContracts: totalCount,
      contracts: contracts.map(c => ({
        id: c.id,
        name: c.name,
        value: c.contractValue,
        status: c.status,
      })),
    });
  }, [contracts, totalCount, updateChatContext]);

  return (
    <>
      {/* ... page UI ... */}
      <ChatButton onClick={() => openChat(chatContext)} />
      
      {/* ... page content ... */}
      <AIChatComponent 
        open={isChatOpen}
        onClose={closeChat}
        context={chatContext}
        title="Contracts AI Assistant"
        pageTitle="Contracts"
      />
    </>
  );
}
```

## Performance Considerations

- **Debounced Requests**: API calls are made only after user finishes typing
- **Message Limiting**: Conversation history includes only recent messages
- **Context Size**: Large datasets are summarized before sending to AI
- **Loading State**: Visual feedback while waiting for AI response

## Future Enhancements

1. **Conversation History**: Persist chat history to database
2. **Advanced Analytics**: AI-powered insights and recommendations
3. **Data Export**: Export AI-generated reports
4. **Multi-turn Conversations**: Context from previous messages
5. **Voice Input**: Voice-to-text for hands-free interaction
6. **Custom AI Models**: Fine-tuned models for specific tasks
7. **Rate Limiting**: User-based rate limiting for API calls
8. **Analytics**: Track which pages/questions are most useful

## Troubleshooting

### Chat Not Opening
- Check browser console for errors
- Verify API key is set in `.env`
- Ensure `useAIChat` hook is initialized

### API Errors
- Check `NEXT_AI_API_KEY` is valid
- Verify internet connection
- Check API quota limits in Google Cloud Console

### Context Not Updating
- Ensure `updateChatContext` is included in useEffect dependencies
- Check that `updateChatContext` is called after data loads
- Verify page data is available before sending

## API Response Format

The Gemini API returns responses in this format:
```json
{
  "candidates": [
    {
      "content": {
        "parts": [
          {
            "text": "AI response here..."
          }
        ]
      }
    }
  ]
}
```

The handler extracts the text and returns:
```json
{
  "message": "AI response here...",
  "success": true
}
```

## Security Best Practices

1. **API Key**: Stored only in server environment, never exposed to client
2. **Input Sanitization**: Messages are validated before sending to API
3. **Rate Limiting**: Consider adding rate limiting for production
4. **Data Privacy**: Context includes only necessary information for context
5. **Error Messages**: Sensitive errors not exposed to users

## Support & Questions

For issues or questions about the AI integration:
1. Check this documentation
2. Review the component code
3. Check API route error logs
4. Verify API configuration in Google Cloud Console

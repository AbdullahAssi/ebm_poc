# EBM Frontend - Document Management & Chatbot System

## 📁 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                    # Admin panel route
│   │   └── page.tsx              # Document upload & management
│   ├── chat/                     # Chat interface route
│   │   └── page.tsx              # Chatbot interface
│   ├── documents/                # Documents library route
│   │   └── page.tsx              # Browse & download documents
│   ├── layout.tsx                # Root layout
│   ├── page.tsx                  # Home (redirects to /chat)
│   └── globals.css               # Global styles & theme variables
│
├── components/
│   ├── ui/                       # Reusable UI components (shadcn-style)
│   │   ├── button.tsx
│   │   ├── card.tsx
│   │   ├── input.tsx
│   │   ├── label.tsx
│   │   └── textarea.tsx
│   ├── admin/                    # Admin-specific components
│   │   ├── upload-form.tsx       # Document upload form with validation
│   │   └── document-list.tsx     # List of uploaded documents
│   ├── documents/                # Document library components
│   │   ├── document-card.tsx     # Individual document card
│   │   ├── document-search.tsx   # Search & filter bar
│   │   └── pagination.tsx        # Pagination controls
│   ├── layout/                   # Layout components
│   │   └── navigation.tsx        # Top navigation bar
│   ├── ChatArea.tsx              # Chat interface
│   ├── ChatLayout.tsx            # Chat page layout
│   ├── Sidebar.tsx               # Chat sidebar
│   └── ThemeToggle.tsx           # Light/dark theme toggle
│
└── lib/
    ├── types.ts                  # TypeScript type definitions
    ├── validations.ts            # Zod validation schemas
    └── utils.ts                  # Utility functions
```

## 🚀 Features

### 1. **Admin Panel** (`/admin`)

- Upload PDF and PPTX files (max 50MB)
- Add document name and description
- Form validation with Zod
- Automatic filename sanitization
- Document management (view, delete)
- Success/error feedback

### 2. **Documents Library** (`/documents`)

- Browse all uploaded documents
- Search by name, description, or keywords
- Filter by file type (PDF/PPTX)
- Pagination (12 items per page)
- Download documents
- Responsive grid layout

### 3. **Chat Interface** (`/chat`)

- AI chatbot with document-aware responses
- Conversation history
- Light/dark theme toggle
- Collapsible sidebar
- Real-time messaging

## 🛠️ Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS 4
- **Form Validation**: React Hook Form + Zod
- **Icons**: Lucide React
- **UI Components**: Custom (shadcn-inspired)

## 📦 Dependencies

```json
{
  "@hookform/resolvers": "latest",
  "react-hook-form": "latest",
  "zod": "latest",
  "class-variance-authority": "latest",
  "clsx": "latest",
  "tailwind-merge": "latest",
  "lucide-react": "latest",
  "react-icons": "latest"
}
```

## 🎨 Design Principles

1. **Component Modularity**: Each component has a single responsibility
2. **Type Safety**: Full TypeScript coverage with proper interfaces
3. **Form Validation**: Client-side validation with Zod schemas
4. **Responsive Design**: Mobile-first approach
5. **Accessibility**: ARIA labels and keyboard navigation
6. **Theme Support**: Light and dark modes with smooth transitions
7. **Performance**: Optimized with pagination and lazy loading

## 📝 Type Definitions

### Document

```typescript
interface Document {
  id: string;
  name: string;
  description: string;
  originalFileName: string;
  type: "pdf" | "pptx";
  size: number;
  uploadDate: Date;
  downloadUrl: string;
  keywords: string[];
}
```

### Upload Form Data

```typescript
interface UploadDocumentFormData {
  documentName: string; // 3-100 characters
  description?: string; // max 500 characters
  file: File; // PDF/PPTX, max 50MB
}
```

## 🔄 API Integration (TODO)

Replace mock data with actual API calls:

### Admin Panel

```typescript
// Upload document
POST /api/documents/upload
FormData: { file, documentName, description }

// Delete document
DELETE /api/documents/{id}

// List documents (admin view)
GET /api/documents?page=1&pageSize=20
```

### Documents Library

```typescript
// Search documents
GET / api / documents / search;
Query: {
  query, type, page, pageSize;
}

// Download document
GET / api / documents / download / { id };
```

### Chat

```typescript
// Send message
POST /api/chat/message
Body: { message, conversationId }

// Get document-aware response
POST /api/chat/query
Body: { query, includeDocuments: true }
```

## 🎯 Next Steps

1. **Backend Integration**

   - Connect to FastAPI backend
   - Implement document upload with embeddings
   - Add document retrieval for chat responses

2. **Authentication**

   - Protect `/admin` route
   - Add user authentication
   - Role-based access control

3. **Enhanced Features**

   - Document preview
   - Advanced search (semantic search)
   - Document tagging system
   - Upload progress indicator
   - Bulk operations

4. **Testing**
   - Unit tests for utilities
   - Component tests with React Testing Library
   - E2E tests with Playwright

## 🚦 Running the Project

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🌐 Routes

- `/` - Redirects to `/chat`
- `/chat` - Chatbot interface
- `/documents` - Document library (public)
- `/admin` - Admin panel (TODO: protect with auth)

## 💡 Best Practices Implemented

✅ Proper folder structure following Next.js conventions  
✅ TypeScript for type safety  
✅ Zod for runtime validation  
✅ Reusable UI components  
✅ Consistent error handling  
✅ Responsive design  
✅ Dark mode support  
✅ Accessibility features  
✅ Code organization and modularity  
✅ Performance optimization

## 📄 License

MIT

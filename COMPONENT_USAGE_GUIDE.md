# Component Usage Guide

Quick reference for using the UI components in the AI Chat Agent project.

---

## 🎨 UI Components

### Button

```tsx
import { Button } from '@/components/ui';

// Primary button
<Button onClick={handleClick}>Click Me</Button>

// Variants
<Button variant="primary">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="danger">Danger</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="outline">Outline</Button>

// Sizes
<Button size="sm">Small</Button>
<Button size="md">Medium</Button>
<Button size="lg">Large</Button>

// Loading state
<Button isLoading>Processing...</Button>

// Disabled
<Button disabled>Disabled</Button>
```

### Card

```tsx
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui';

<Card>
  <CardHeader>
    <CardTitle>Card Title</CardTitle>
  </CardHeader>
  <CardContent>
    <p>Card content goes here</p>
  </CardContent>
</Card>

// With hover effect
<Card hover>
  <CardContent>Hover over me</CardContent>
</Card>

// Custom padding
<Card padding="none">No padding</Card>
<Card padding="sm">Small padding</Card>
<Card padding="lg">Large padding</Card>
```

### Input

```tsx
import { Input } from '@/components/ui';

// Basic input
<Input
  label="Email"
  type="email"
  placeholder="you@example.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
/>

// With error
<Input
  label="Password"
  type="password"
  error="Password is required"
  required
/>

// With helper text
<Input
  label="Username"
  helperText="Choose a unique username"
/>
```

### Textarea

```tsx
import { Textarea } from '@/components/ui';

<Textarea
  label="Description"
  rows={4}
  placeholder="Enter description..."
  helperText="Max 500 characters"
/>
```

### Select

```tsx
import { Select } from '@/components/ui';

const options = [
  { value: 'option1', label: 'Option 1' },
  { value: 'option2', label: 'Option 2' },
];

<Select
  label="Choose an option"
  options={options}
  value={selected}
  onChange={(e) => setSelected(e.target.value)}
/>
```

### Badge

```tsx
import { Badge } from '@/components/ui';

// Variants
<Badge variant="default">Default</Badge>
<Badge variant="success">Success</Badge>
<Badge variant="warning">Warning</Badge>
<Badge variant="danger">Danger</Badge>
<Badge variant="info">Info</Badge>

// Sizes
<Badge size="sm">Small</Badge>
<Badge size="md">Medium</Badge>
```

### Modal

```tsx
import { Modal, Button } from '@/components/ui';
import { useState } from 'react';

function MyComponent() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <Button onClick={() => setIsOpen(true)}>Open Modal</Button>

      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title="Modal Title"
        size="md"
        footer={
          <>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>Save</Button>
          </>
        }
      >
        <p>Modal content goes here</p>
      </Modal>
    </>
  );
}
```

---

## 💬 Chat Components

### ChatInterface

```tsx
import { ChatInterface } from '@/components/chat/ChatInterface';

<ChatInterface
  conversationId="123"
  initialMessages={messages}
  onSendMessage={async (message) => {
    // Handle sending message
    await sendMessage(message);
  }}
/>
```

### ChatMessage

```tsx
import { ChatMessage, Message } from '@/components/chat/ChatMessage';

const message: Message = {
  id: '1',
  role: 'user', // or 'assistant' or 'system'
  content: 'Hello!',
  timestamp: new Date().toISOString(),
  function_calls: [
    {
      name: 'get_contact',
      status: 'success',
      result: { name: 'John' }
    }
  ]
};

<ChatMessage message={message} />
```

### ChatInput

```tsx
import { ChatInput } from '@/components/chat/ChatInput';

<ChatInput
  onSend={(message) => console.log(message)}
  isLoading={false}
  placeholder="Type your message..."
/>
```

---

## 🏗️ Layout Components

### DashboardLayout

Automatically applied to all `/dashboard/*` routes via `app/dashboard/layout.tsx`.

To use in a page:
```tsx
// app/dashboard/my-page/page.tsx
export default function MyPage() {
  return (
    <div>
      <h1>My Page</h1>
      {/* Content automatically wrapped in DashboardLayout */}
    </div>
  );
}
```

---

## 🎯 Common Patterns

### Form with Validation

```tsx
'use client';

import { useState } from 'react';
import { Input, Button, Card, CardContent } from '@/components/ui';

export default function MyForm() {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.name) newErrors.name = 'Name is required';
    if (!formData.email) newErrors.email = 'Email is required';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // Submit form
    await submitData(formData);
  };

  return (
    <Card>
      <CardContent className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            error={errors.name}
            required
          />
          <Input
            label="Email"
            type="email"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            error={errors.email}
            required
          />
          <Button type="submit">Submit</Button>
        </form>
      </CardContent>
    </Card>
  );
}
```

### List with Search and Filter

```tsx
'use client';

import { useState } from 'react';
import { Input, Button, Card } from '@/components/ui';

export default function MyList() {
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all');

  const items = [/* your data */];

  const filteredItems = items.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filter === 'all' || item.status === filter;
    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-6">
      {/* Search and filters */}
      <Card>
        <div className="p-6 flex gap-4">
          <Input
            placeholder="Search..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <Button
            variant={filter === 'all' ? 'primary' : 'ghost'}
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button
            variant={filter === 'active' ? 'primary' : 'ghost'}
            onClick={() => setFilter('active')}
          >
            Active
          </Button>
        </div>
      </Card>

      {/* Results */}
      <div className="space-y-3">
        {filteredItems.map(item => (
          <Card key={item.id} hover>
            {/* Item content */}
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Stats Grid

```tsx
import { Card, CardContent } from '@/components/ui';

export default function StatsGrid() {
  const stats = [
    { label: 'Total Users', value: '1,234', icon: '👥', color: 'blue' },
    { label: 'Revenue', value: '$12.4k', icon: '💰', color: 'green' },
    { label: 'Active', value: '89%', icon: '📈', color: 'purple' },
    { label: 'Growth', value: '+12%', icon: '🚀', color: 'orange' },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats.map((stat, i) => (
        <Card key={i}>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">{stat.label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">
                  {stat.value}
                </p>
              </div>
              <div className={`text-4xl opacity-20`}>
                {stat.icon}
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
```

### Loading States

```tsx
import { Button, Card, CardContent } from '@/components/ui';
import { useState } from 'react';

export default function WithLoading() {
  const [isLoading, setIsLoading] = useState(false);

  const handleAction = async () => {
    setIsLoading(true);
    try {
      await performAction();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button onClick={handleAction} isLoading={isLoading}>
        Save Changes
      </Button>

      {isLoading ? (
        <Card>
          <CardContent className="p-12 text-center">
            <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </CardContent>
        </Card>
      ) : (
        <Card>
          {/* Content */}
        </Card>
      )}
    </>
  );
}
```

### Empty State

```tsx
import { Card, CardContent, Button } from '@/components/ui';

export default function EmptyState() {
  return (
    <Card>
      <CardContent className="p-12 text-center">
        <svg
          className="w-16 h-16 mx-auto text-gray-400 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No items yet
        </h3>
        <p className="text-gray-600 mb-4">
          Get started by creating your first item
        </p>
        <Button>Create Item</Button>
      </CardContent>
    </Card>
  );
}
```

---

## 🎨 Styling Tips

### Custom Classes

All components accept a `className` prop for custom styling:

```tsx
<Button className="w-full mt-4">
  Full Width Button
</Button>

<Card className="border-2 border-blue-500">
  Custom Border Card
</Card>
```

### Responsive Design

Use Tailwind's responsive prefixes:

```tsx
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
  {/* Responsive grid */}
</div>

<Button className="w-full md:w-auto">
  {/* Full width on mobile, auto on desktop */}
</Button>
```

### Colors

Standard color scheme:
- **Primary:** Blue (`bg-blue-600`, `text-blue-600`)
- **Success:** Green (`bg-green-600`, `text-green-600`)
- **Warning:** Yellow (`bg-yellow-600`, `text-yellow-600`)
- **Danger:** Red (`bg-red-600`, `text-red-600`)
- **Info:** Purple (`bg-purple-600`, `text-purple-600`)

---

## 🚀 Best Practices

1. **Always use TypeScript types** - Import interfaces for better autocomplete
2. **Client components** - Add `'use client'` for interactive components
3. **Loading states** - Show feedback during async operations
4. **Error handling** - Display user-friendly error messages
5. **Accessibility** - Use proper labels and ARIA attributes
6. **Responsive** - Test on mobile, tablet, and desktop
7. **Consistent spacing** - Use Tailwind's spacing scale

---

## 📚 More Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)

---

*This guide covers all the UI components built for the AI Chat Agent project. All components are production-ready and follow best practices.*

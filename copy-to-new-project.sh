#!/bin/bash
# Copy All Documentation to New Project
# Run this from: /mnt/c/Development/Ai_Agent/

NEW_PROJECT_PATH="/mnt/c/Development/ai-chat-agent"

echo "📦 Copying documentation to new project..."
echo "Target: $NEW_PROJECT_PATH"
echo ""

# Check if target exists
if [ ! -d "$NEW_PROJECT_PATH" ]; then
  echo "❌ Error: Project directory not found at $NEW_PROJECT_PATH"
  echo "Please create the Next.js project first!"
  exit 1
fi

# Copy core documentation
echo "📄 Copying core documentation..."
cp PROJECT_OVERVIEW.md "$NEW_PROJECT_PATH/"
cp IMPLEMENTATION_CHECKLIST.md "$NEW_PROJECT_PATH/"
cp README.md "$NEW_PROJECT_PATH/ARCHITECTURE_README.md"
cp SETUP.md "$NEW_PROJECT_PATH/"
cp ATTACK_KIT_REFERENCE.md "$NEW_PROJECT_PATH/"
cp RESOURCES_INDEX.md "$NEW_PROJECT_PATH/"
cp QUICK_START.md "$NEW_PROJECT_PATH/"

# Copy technical docs
echo "📚 Copying technical documentation..."
mkdir -p "$NEW_PROJECT_PATH/docs"
cp docs/*.md "$NEW_PROJECT_PATH/docs/"

# Copy database migration
echo "🗄️ Copying database migration..."
mkdir -p "$NEW_PROJECT_PATH/supabase/migrations"
cp supabase/migrations/*.sql "$NEW_PROJECT_PATH/supabase/migrations/"

# Copy Spec Kit structure
echo "📝 Copying Spec Kit structure..."
mkdir -p "$NEW_PROJECT_PATH/.specify/memory"
cp .specify/memory/*.md "$NEW_PROJECT_PATH/.specify/memory/"

# Copy Resources
echo "🔑 Copying Resources guide..."
mkdir -p "$NEW_PROJECT_PATH/Resources"
cp Resources/*.md "$NEW_PROJECT_PATH/Resources/"

# Copy configuration files
echo "⚙️ Copying configuration files..."
cp .env.local.template "$NEW_PROJECT_PATH/"
cp lib/config.ts "$NEW_PROJECT_PATH/lib/"
cp lib/logger.ts "$NEW_PROJECT_PATH/lib/"
cp lib/api-response.ts "$NEW_PROJECT_PATH/lib/"
cp lib/errors.ts "$NEW_PROJECT_PATH/lib/"

# Copy enhanced tsconfig
echo "🔧 Copying TypeScript config..."
cp tsconfig.json.enhanced "$NEW_PROJECT_PATH/tsconfig.json.enhanced"

# Copy gitignore additions
echo "🚫 Copying gitignore additions..."
cp .gitignore.additions "$NEW_PROJECT_PATH/"

# Copy project README
echo "📖 Copying project README..."
cp PROJECT_README.md "$NEW_PROJECT_PATH/README.md"

echo ""
echo "✅ All files copied successfully!"
echo ""
echo "Next steps:"
echo "1. cd $NEW_PROJECT_PATH"
echo "2. Merge .gitignore.additions into .gitignore"
echo "3. Copy .env.local.template to .env.local and fill in values"
echo "4. Open IMPLEMENTATION_CHECKLIST.md and continue with Day 2!"
echo ""
echo "🎉 Day 1 Complete!"

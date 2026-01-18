# BiteCheck Phase 2: AI-Powered Food & Calorie Tracking

<p align="center">
  <img src="https://img.shields.io/badge/Status-In%20Development-yellow" alt="Status"/>
  <img src="https://img.shields.io/badge/Version-2.0.0--alpha-blue" alt="Version"/>
  <img src="https://img.shields.io/badge/AI-Gemini%20%2B%20Perplexity-purple" alt="AI"/>
</p>

> **Transform BiteCheck from a barcode scanning app into a comprehensive AI-powered food logging and calorie tracking platform.**

---

## 📋 Table of Contents

- [Overview](#-overview)
- [What's New in Phase 2](#-whats-new-in-phase-2)
- [Architecture](#-architecture)
- [Feature Breakdown](#-feature-breakdown)
  - [Core UX Features](#1-core-user-experience--ui-features)
  - [AI Integration](#2-ai-logic--integration)
  - [Reliability](#3-reliability--connectivity)
  - [Analytics](#4-growth--analytics-features)
- [Database Schema](#-database-schema)
- [API Reference](#-api-reference)
- [Setup & Configuration](#-setup--configuration)
- [Implementation Timeline](#-implementation-timeline)
- [Tech Stack Additions](#-tech-stack-additions)

---

## 🎯 Overview

Phase 2 expands BiteCheck beyond barcode scanning to solve **two core problems**:

| Problem              | Solution                                                               |
| -------------------- | ---------------------------------------------------------------------- |
| **Food Tracking**    | Notes-style interface for logging any food, not just barcoded products |
| **Calorie Tracking** | AI-powered nutrition analysis from photos and text descriptions        |

### Key Differentiators

- 📝 **Apple Notes-style interface** — Type food on the left, see nutrition on the right
- 📸 **Photo-to-calories** — Take a photo, get instant calorie estimates via AI
- ⚡ **Smart cost optimization** — Lightweight AI for simple edits, full AI for complex requests
- 📴 **Offline-first** — Queue entries while offline, sync when connected
- 💾 **Saved meals** — One-tap insertion of frequently eaten meals

---

## 🆕 What's New in Phase 2

```
Phase 1 (Completed)          Phase 2 (New)
━━━━━━━━━━━━━━━━━━━          ━━━━━━━━━━━━━━━━━━━
✅ Barcode scanning      →   📝 Notes-style food logging
✅ Product lookup        →   📸 Photo AI analysis
✅ Nutrition display     →   🎯 Custom micronutrient tracking
✅ User preferences      →   ⚡ Saved meals / Quick add
✅ History & favorites   →   📴 Offline mode with sync
✅ Corrections flow      →   🔔 Smart reminders
✅ Admin dashboard       →   📊 PostHog analytics
                         →   💰 LLM cost tracking
                         →   🎨 In-depth onboarding
```

---

## 🏗 Architecture

### System Overview

```
┌─────────────────────────────────────────────────────────────────────────┐
│                           USER DEVICE                                    │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │   Onboard   │  │  Food Log   │  │    Scan     │  │   Profile   │    │
│  │   Flow      │  │  (NEW)      │  │  (Existing) │  │  Settings   │    │
│  └─────────────┘  └──────┬──────┘  └─────────────┘  └─────────────┘    │
│                          │                                              │
│  ┌───────────────────────┴───────────────────────┐                     │
│  │              OFFLINE STORAGE LAYER             │                     │
│  │   SQLite + AsyncStorage + Sync Queue          │                     │
│  └───────────────────────┬───────────────────────┘                     │
└──────────────────────────┼──────────────────────────────────────────────┘
                           │
                           ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                        BACKEND (FastAPI)                                 │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │  /food/*    │  │  /meals/*   │  │   /ai/*     │  │ /notify/*   │    │
│  │  Logging    │  │  Saved      │  │  Analysis   │  │ Reminders   │    │
│  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘  └──────┬──────┘    │
│         │                │                │                │            │
│  ┌──────┴────────────────┴────────────────┴────────────────┴──────┐    │
│  │                      AI SERVICE LAYER                           │    │
│  │  ┌─────────────────┐            ┌─────────────────┐            │    │
│  │  │  Gemini Flash   │    ───▶    │ Perplexity Sonar│            │    │
│  │  │  (Image→Text)   │            │ (Text→Nutrition)│            │    │
│  │  └─────────────────┘            └─────────────────┘            │    │
│  └────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────┬───────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                         SUPABASE                                         │
├─────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐    │
│  │food_entries │  │saved_meals  │  │nutrient_    │  │ai_usage_    │    │
│  │             │  │             │  │targets      │  │logs         │    │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘

                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────────┐
│                      EXTERNAL SERVICES                                   │
├─────────────────────────────────────────────────────────────────────────┤
│  PostHog (Analytics)  │  User Jot (Feedback)  │  Expo Push (Reminders) │
└─────────────────────────────────────────────────────────────────────────┘
```

### AI Pipeline Flow

```
┌──────────────────────────────────────────────────────────────────┐
│                      PHOTO ANALYSIS PIPELINE                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   📷 Photo    ───▶   🤖 Gemini Flash    ───▶   🔍 Perplexity     │
│   (Base64)          "2 scrambled eggs         "Research and      │
│                      with toast and           calculate           │
│                      avocado on white         calories for        │
│                      plate"                   this meal"          │
│                                                      │            │
│                                                      ▼            │
│                                               📊 Nutrition        │
│                                               {                   │
│                                                 calories: 380,    │
│                                                 protein: 18g,     │
│                                                 carbs: 24g,       │
│                                                 fat: 26g          │
│                                               }                   │
└──────────────────────────────────────────────────────────────────┘

┌──────────────────────────────────────────────────────────────────┐
│                    SMART EDIT CLASSIFICATION                      │
├──────────────────────────────────────────────────────────────────┤
│                                                                   │
│   User Request: "I only ate half of this"                        │
│                           │                                       │
│                           ▼                                       │
│                  🤖 Gemini Flash                                  │
│                  (Classification)                                 │
│                     │         │                                   │
│            ┌───────┘         └────────┐                          │
│            ▼                          ▼                          │
│     SIMPLE ──▶ Local Math      COMPLEX ──▶ Perplexity            │
│     "Half portion"             "Add bacon"                       │
│     calories / 2               Research new item                 │
│                                                                   │
└──────────────────────────────────────────────────────────────────┘
```

---

## 📱 Feature Breakdown

### 1. Core User Experience & UI Features

#### 📝 Notes-Style Interface

The heart of Phase 2 is a new food logging experience inspired by Apple Notes:

```
┌────────────────────────────────────────────────────────────────┐
│  ← Back                Today, Jan 18                    ⚙️     │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  🌅 Breakfast                                    Total: 480    │
│  ┌─────────────────────────┬──────────────────────────────┐   │
│  │                         │                              │   │
│  │  2 eggs with toast     │  Calories    380             │   │
│  │  and avocado           │  ─────────────────           │   │
│  │                         │  Protein     18g             │   │
│  │  [📷 Photo attached]    │  Carbs       24g             │   │
│  │                         │  Fat         26g             │   │
│  │                         │                              │   │
│  │              [✏️ Edit]  │              [📊 Details]    │   │
│  └─────────────────────────┴──────────────────────────────┘   │
│                                                                │
│  ☕ Morning Snack                                              │
│  ┌─────────────────────────┬──────────────────────────────┐   │
│  │                         │                              │   │
│  │  Coffee with oat milk   │  Calories    100             │   │
│  │                         │  ─────────────────           │   │
│  │                         │  Sugar       8g              │   │
│  │                         │                              │   │
│  └─────────────────────────┴──────────────────────────────┘   │
│                                                                │
│  ☀️ Lunch                                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │                                                         │  │
│  │  Type what you ate...                        [📷] [⚡]  │  │
│  │                                                         │  │
│  └─────────────────────────────────────────────────────────┘  │
│                                                                │
├────────────────────────────────────────────────────────────────┤
│  Daily Summary: 580 / 2000 cal  ████░░░░░░░░░░░░░░░  29%      │
└────────────────────────────────────────────────────────────────┘
```

**Key behaviors:**

- Real-time nutrition calculation as user types
- Tap photo icon to capture/upload food image
- Tap ⚡ for quick add saved meals
- Swipe entry left to delete
- Tap entry to edit or request AI adjustment

---

#### 🎨 In-Depth Onboarding

A multi-step onboarding flow designed to increase user investment:

| Step | Screen           | Purpose                                                           |
| ---- | ---------------- | ----------------------------------------------------------------- |
| 1    | Welcome          | App introduction with animated illustration                       |
| 2    | Goals            | What are you trying to achieve? (lose weight, build muscle, etc.) |
| 3    | Diet Preferences | Vegetarian, vegan, keto, etc.                                     |
| 4    | Allergies        | Select food allergies for warnings                                |
| 5    | Nutrients        | Which nutrients do you want to track?                             |
| 6    | Daily Targets    | Set calorie and macro goals                                       |
| 7    | Reminders        | Opt-in for meal reminders                                         |
| 8    | Completion       | Ready to start!                                                   |

**Animation System:**

- Each screen features custom hand-drawn style illustrations
- Illustrations animate/change based on user selections
- Uses Lottie for smooth, lightweight animations

---

#### ⚡ Quick Add / Saved Meals

One-tap meal insertion for frequently eaten foods:

```
┌─────────────────────────────────────────────┐
│  ⚡ Quick Add                           ✕   │
├─────────────────────────────────────────────┤
│  🔍 Search saved meals...                   │
├─────────────────────────────────────────────┤
│                                             │
│  ⭐ Frequently Used                         │
│  ┌───────────────────────────────────────┐ │
│  │ 🥣 Morning Oatmeal         320 cal   │ │
│  │    Used 23 times                      │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ 🥗 Chicken Salad           450 cal   │ │
│  │    Used 15 times                      │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ 🌮 Breakfast Tacos        520 cal    │ │
│  │    Used 12 times                      │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  📝 Recently Added                          │
│  ...                                        │
│                                             │
└─────────────────────────────────────────────┘
```

**Benefits:**

- ⚡ Instant logging — no AI call needed
- 💰 Cost savings — reuses cached nutrition data
- 🎯 Accuracy — consistent data for repeated meals

---

#### 📊 Micronutrient Tracking

Beyond calories, track the nutrients that matter to you:

**Default Tracked:**

- Calories
- Protein
- Carbohydrates
- Fat

**Optional Toggles:**

- Sugar
- Fiber
- Sodium
- Saturated Fat
- Cholesterol
- Vitamin D
- Iron
- Calcium
- Potassium

**Settings UI:**

```
┌─────────────────────────────────────────────┐
│  Nutrient Tracking                          │
├─────────────────────────────────────────────┤
│                                             │
│  ALWAYS TRACKED                             │
│  ────────────────────────────────────────── │
│  Calories                      2000 / day   │
│  Protein                       50g / day    │
│  Carbohydrates                250g / day    │
│  Fat                          65g / day     │
│                                             │
│  ADDITIONAL (tap to enable)                 │
│  ────────────────────────────────────────── │
│  ○ Sugar                       [Set target] │
│  ● Fiber               ✓       25g / day    │
│  ○ Sodium                      [Set target] │
│  ○ Saturated Fat              [Set target] │
│  ...                                        │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 2. AI Logic & Integration

#### 📸 Photo Logging (Multi-Model AI)

**Pipeline:**

1. **Image Capture** → User takes/uploads photo
2. **Image Description** → Gemini 2.5 Flash Light analyzes image
3. **Nutrition Research** → Perplexity Sonar calculates calories
4. **Result Display** → Show nutrition with confidence indicator

**Example Flow:**

```
User takes photo of lunch plate
         │
         ▼
┌─────────────────────────────────────┐
│ Gemini 2.5 Flash Light              │
│ ─────────────────────────────────── │
│ "A plate containing approximately   │
│  6 oz grilled chicken breast,       │
│  1 cup steamed broccoli with        │
│  butter, and 3/4 cup brown rice"    │
└──────────────────┬──────────────────┘
                   │
                   ▼
┌─────────────────────────────────────┐
│ Perplexity Sonar                    │
│ ─────────────────────────────────── │
│ Input: Gemini's description         │
│ Output: {                           │
│   calories: 520,                    │
│   protein: 45g,                     │
│   carbs: 42g,                       │
│   fat: 18g,                         │
│   fiber: 6g,                        │
│   confidence: 0.85                  │
│ }                                   │
└─────────────────────────────────────┘
```

---

#### 🧠 Smart Edit Classification

Cost-efficient AI usage by classifying edit requests:

| Request Type        | Handler    | Example                      |
| ------------------- | ---------- | ---------------------------- |
| **Simple Portion**  | Local Math | "Half of this", "2 servings" |
| **Simple Multiply** | Local Math | "Double the portion"         |
| **Addition**        | Perplexity | "Add bacon to this"          |
| **Substitution**    | Perplexity | "Replace rice with quinoa"   |
| **Complex**         | Perplexity | "Make this low-carb version" |

**Classification Prompt (Gemini):**

```
Classify this food edit request into one of:
- PORTION_CHANGE: User wants to multiply/divide amounts (e.g., "half", "double", "2x")
- ADDITION: User wants to add something (e.g., "add cheese")
- SUBSTITUTION: User wants to replace something (e.g., "swap X for Y")
- COMPLEX: Anything else requiring research

Request: "{user_input}"
Output: Just the category name
```

---

#### ✏️ Requesting Edits

Let users refine AI-generated nutrition data:

```
┌─────────────────────────────────────────────┐
│  ✏️ Edit Entry                         ✕    │
├─────────────────────────────────────────────┤
│                                             │
│  Original: 2 eggs with toast and avocado    │
│  Calories: 380                              │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ I only ate half of it                 │ │
│  └───────────────────────────────────────┘ │
│                                             │
│              [Submit Request]               │
│                                             │
└─────────────────────────────────────────────┘

         ▼ After AI processing ▼

┌─────────────────────────────────────────────┐
│  📊 Proposed Changes                        │
├─────────────────────────────────────────────┤
│                                             │
│  Calories    380 → 190    ▼ 50%            │
│  Protein     18g → 9g     ▼ 50%            │
│  Carbs       24g → 12g    ▼ 50%            │
│  Fat         26g → 13g    ▼ 50%            │
│                                             │
│     [❌ Reject]         [✅ Accept]         │
│                                             │
└─────────────────────────────────────────────┘
```

---

### 3. Reliability & Connectivity

#### 📴 Offline Mode

Seamless operation without internet connectivity:

**When Offline:**

- Indicator appears in header
- Food entries saved locally
- Photos stored in device cache
- Operations queued for sync

**When Back Online:**

- Automatic sync triggered
- Queue processed in order
- Conflicts resolved (server wins by default)
- User notified of sync status

**Local Storage Structure:**

```typescript
// AsyncStorage Keys
@bitecheck:queue              // Pending operations
@bitecheck:local_entries      // Locally created entries
@bitecheck:cached_photos      // Photo cache
@bitecheck:last_sync          // Last successful sync timestamp
@bitecheck:user_data          // Cached user preferences
```

**Offline Indicator UI:**

```
┌────────────────────────────────────────────┐
│  ⚠️ You're offline                         │
│  3 entries pending sync                    │
└────────────────────────────────────────────┘
```

---

#### 🌍 Time Zone Support

Log food in your current timezone, see history correctly:

**Features:**

- Auto-detect timezone on app launch
- Manual timezone override in settings
- History grouped by local date
- Travel-friendly date handling

**Implementation:**

```typescript
// All timestamps stored as UTC in database
// Converted to user's timezone for display

const userTimezone = user.preferences.timezone || "auto";
const displayDate = convertToTimezone(entry.created_at, userTimezone);
```

---

### 4. Growth & Analytics Features

#### 💬 Integrated Feedback Board

User Jot integration for feature requests:

```
┌─────────────────────────────────────────────┐
│  💬 Feedback & Suggestions                  │
├─────────────────────────────────────────────┤
│                                             │
│  Help us make BiteCheck better!             │
│                                             │
│  ┌───────────────────────────────────────┐ │
│  │ 🐛 Report a Bug                       │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ 💡 Suggest a Feature                  │ │
│  └───────────────────────────────────────┘ │
│  ┌───────────────────────────────────────┐ │
│  │ 📋 View Feature Roadmap               │ │
│  └───────────────────────────────────────┘ │
│                                             │
│  Your feedback has shaped:                  │
│  • Dark mode (coming soon!)                │
│  • Recipe import                           │
│  • Barcode scanning improvements           │
│                                             │
└─────────────────────────────────────────────┘
```

---

#### 📊 Retention Analytics (PostHog)

Track key metrics for product growth:

**Core Events:**
| Event | Description | Priority |
|-------|-------------|----------|
| `food_logged` | User logs any food entry | 🔴 Critical |
| `photo_analyzed` | User uses photo AI | 🟠 High |
| `saved_meal_used` | User quick-adds a meal | 🟠 High |
| `onboarding_step_X` | Onboarding progression | 🟡 Medium |
| `reminder_sent` | Reminder notification sent | 🟡 Medium |
| `reminder_opened` | User opened from reminder | 🟡 Medium |

**Key Dashboards:**

1. **W1 Retention** — % of users who log food in week 2
2. **Onboarding Funnel** — Drop-off at each step
3. **Core Action Rate** — % of DAU that logs food
4. **AI Usage** — Photo vs. text logging ratio

---

#### 💰 LLM Cost Tracking

Monitor AI costs per user and model:

**Admin Dashboard View:**

```
┌─────────────────────────────────────────────────────────────────────┐
│  💰 AI Cost Dashboard                        Last 30 days           │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  Total Spend: $124.56                      Avg per user: $0.08     │
│                                                                     │
│  BY MODEL                                                           │
│  ──────────────────────────────────────────────────────────────    │
│  Gemini Flash Light        $45.20   ████████░░░░░░░░  36%          │
│  Perplexity Sonar          $79.36   ██████████████░░  64%          │
│                                                                     │
│  BY OPERATION                                                       │
│  ──────────────────────────────────────────────────────────────    │
│  Image Description         $45.20   ████████░░░░░░░░  36%          │
│  Nutrition Lookup          $68.90   ███████████░░░░░  55%          │
│  Edit Classification       $10.46   ██░░░░░░░░░░░░░░   9%          │
│                                                                     │
│  TOP USERS BY COST                                                  │
│  ──────────────────────────────────────────────────────────────    │
│  user_123@...              $2.45    45 requests                    │
│  user_456@...              $1.89    32 requests                    │
│  ...                                                                │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

#### 🔔 Smart Reminders

Opt-in notification system to boost retention:

**Reminder Logic:**

1. User opts in during onboarding
2. System tracks last food log time
3. If no log within X hours → send reminder
4. Respect quiet hours (default: 10pm - 8am)
5. Max Y reminders per day

**Reminder Settings:**

```
┌─────────────────────────────────────────────┐
│  🔔 Reminder Settings                       │
├─────────────────────────────────────────────┤
│                                             │
│  Meal Reminders                 [ON]        │
│  ────────────────────────────────────────── │
│                                             │
│  Remind me if I haven't logged:             │
│  • Breakfast                  by 10:00 AM   │
│  • Lunch                      by 2:00 PM    │
│  • Dinner                     by 8:00 PM    │
│                                             │
│  Quiet Hours                                │
│  ────────────────────────────────────────── │
│  Don't disturb between:                     │
│  [10:00 PM]  to  [8:00 AM]                  │
│                                             │
│  Daily Limit: [3] reminders max             │
│                                             │
└─────────────────────────────────────────────┘
```

---

## 🗄 Database Schema

### New Tables

```sql
-- Food entries logged by users
CREATE TABLE food_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    entry_date DATE NOT NULL DEFAULT CURRENT_DATE,
    entry_time TIME NOT NULL DEFAULT CURRENT_TIME,
    meal_type TEXT CHECK (meal_type IN ('breakfast', 'lunch', 'dinner', 'snack')),
    food_text TEXT NOT NULL,
    nutrition_data JSONB,
    source TEXT CHECK (source IN ('manual', 'photo', 'saved_meal', 'barcode')),
    photo_url TEXT,
    ai_description TEXT,
    is_synced BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Saved meals for quick add functionality
CREATE TABLE saved_meals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    food_text TEXT NOT NULL,
    nutrition_data JSONB NOT NULL,
    photo_url TEXT,
    use_count INTEGER DEFAULT 0,
    last_used_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- User's nutrient tracking preferences
CREATE TABLE user_nutrient_targets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    tracked_nutrients JSONB DEFAULT '["calories", "protein", "carbs", "fat"]',
    daily_targets JSONB DEFAULT '{"calories": 2000, "protein": 50, "carbs": 250, "fat": 65}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- AI API usage tracking
CREATE TABLE ai_usage_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
    model TEXT NOT NULL,
    operation TEXT NOT NULL,
    input_tokens INTEGER,
    output_tokens INTEGER,
    cost_usd DECIMAL(10, 6),
    cached_response BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- Notification preferences
CREATE TABLE notification_preferences (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    reminders_enabled BOOLEAN DEFAULT false,
    quiet_hours_start TIME DEFAULT '22:00',
    quiet_hours_end TIME DEFAULT '08:00',
    max_daily_reminders INTEGER DEFAULT 3,
    meal_reminder_times JSONB DEFAULT '{"breakfast": "10:00", "lunch": "14:00", "dinner": "20:00"}',
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Schema updates to existing tables
ALTER TABLE users_meta ADD COLUMN IF NOT EXISTS timezone TEXT DEFAULT 'UTC';
ALTER TABLE users_meta ADD COLUMN IF NOT EXISTS onboarding_completed BOOLEAN DEFAULT false;
ALTER TABLE users_meta ADD COLUMN IF NOT EXISTS onboarding_step INTEGER DEFAULT 0;
```

### Entity Relationship Diagram

```
┌─────────────────┐       ┌─────────────────┐
│   auth.users    │       │   users_meta    │
│─────────────────│       │─────────────────│
│ id (PK)         │◄──────│ user_id (FK)    │
│ email           │       │ allergies       │
│ ...             │       │ diets           │
└────────┬────────┘       │ timezone (NEW)  │
         │                └─────────────────┘
         │
    ┌────┴────────────────────────┬───────────────────────┐
    │                             │                       │
    ▼                             ▼                       ▼
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│  food_entries   │    │  saved_meals    │    │ nutrient_targets│
│─────────────────│    │─────────────────│    │─────────────────│
│ id (PK)         │    │ id (PK)         │    │ id (PK)         │
│ user_id (FK)    │    │ user_id (FK)    │    │ user_id (FK)    │
│ entry_date      │    │ name            │    │ tracked_nutrients│
│ meal_type       │    │ food_text       │    │ daily_targets   │
│ food_text       │    │ nutrition_data  │    └─────────────────┘
│ nutrition_data  │    │ use_count       │
│ source          │    └─────────────────┘
│ photo_url       │
└─────────────────┘
```

---

## 🔌 API Reference

### Food Logging Endpoints

| Method   | Endpoint                    | Description                |
| -------- | --------------------------- | -------------------------- |
| `POST`   | `/api/v1/food/log`          | Log a new food entry       |
| `GET`    | `/api/v1/food/entries`      | Get entries for date range |
| `GET`    | `/api/v1/food/entries/{id}` | Get single entry           |
| `PUT`    | `/api/v1/food/entries/{id}` | Update an entry            |
| `DELETE` | `/api/v1/food/entries/{id}` | Delete an entry            |
| `GET`    | `/api/v1/food/summary`      | Get daily/weekly summary   |

### AI Endpoints

| Method | Endpoint                   | Description              |
| ------ | -------------------------- | ------------------------ |
| `POST` | `/api/v1/ai/analyze-photo` | Process food photo       |
| `POST` | `/api/v1/ai/analyze-text`  | Get nutrition for text   |
| `POST` | `/api/v1/ai/request-edit`  | Process edit request     |
| `POST` | `/api/v1/ai/classify-edit` | Classify edit complexity |

### Saved Meals Endpoints

| Method   | Endpoint                 | Description            |
| -------- | ------------------------ | ---------------------- |
| `POST`   | `/api/v1/meals`          | Save a new meal        |
| `GET`    | `/api/v1/meals`          | Get user's saved meals |
| `GET`    | `/api/v1/meals/{id}`     | Get single meal        |
| `PUT`    | `/api/v1/meals/{id}`     | Update a meal          |
| `DELETE` | `/api/v1/meals/{id}`     | Delete a meal          |
| `POST`   | `/api/v1/meals/{id}/use` | Use meal (log entry)   |

### Nutrient Tracking Endpoints

| Method | Endpoint                     | Description        |
| ------ | ---------------------------- | ------------------ |
| `GET`  | `/api/v1/nutrients/targets`  | Get user's targets |
| `PUT`  | `/api/v1/nutrients/targets`  | Update targets     |
| `GET`  | `/api/v1/nutrients/progress` | Get daily progress |

---

## ⚙️ Setup & Configuration

### Environment Variables

Add to `backend/.env`:

```bash
# AI Services
GEMINI_API_KEY=your_gemini_api_key
PERPLEXITY_API_KEY=your_perplexity_api_key

# Analytics
POSTHOG_API_KEY=your_posthog_key
POSTHOG_HOST=https://app.posthog.com

# Notifications
EXPO_PUSH_ACCESS_TOKEN=your_expo_token

# Feature Flags
ENABLE_PHOTO_LOGGING=true
ENABLE_SMART_EDITS=true
ENABLE_OFFLINE_MODE=true
```

Add to `frontend/.env`:

```bash
# Existing
EXPO_PUBLIC_SUPABASE_URL=your_supabase_url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your_supabase_key
EXPO_PUBLIC_API_URL=http://localhost:8000

# New for Phase 2
EXPO_PUBLIC_POSTHOG_KEY=your_posthog_key
EXPO_PUBLIC_POSTHOG_HOST=https://app.posthog.com
EXPO_PUBLIC_USERJOT_ID=your_userjot_id
```

### API Key Setup

1. **Gemini API**
   - Go to [Google AI Studio](https://aistudio.google.com/)
   - Create API key for Gemini 2.5 Flash Light
   - Add to environment

2. **Perplexity API**
   - Go to [Perplexity API](https://docs.perplexity.ai/)
   - Create API key for Sonar model
   - Add to environment

3. **PostHog**
   - Create account at [PostHog](https://posthog.com/)
   - Create project and get API key
   - Add to environment

---

## 📅 Implementation Timeline

| Week | Phase       | Focus             | Deliverables                            |
| ---- | ----------- | ----------------- | --------------------------------------- |
| 1    | Setup       | Database & Models | New tables, migrations, Pydantic models |
| 2    | Backend     | Food Logging      | CRUD endpoints, basic validation        |
| 3    | Backend     | AI Integration    | Gemini + Perplexity services            |
| 4    | Frontend    | Notes UI          | FoodLogScreen, entry components         |
| 5    | Integration | Photo Flow        | Camera → AI → Display pipeline          |
| 6    | Frontend    | Saved Meals       | Quick add feature complete              |
| 7    | Backend     | Smart Edits       | Classification + processing             |
| 8    | Frontend    | Offline Mode      | Local storage + sync                    |
| 9    | Integration | Analytics         | PostHog events + cost tracking          |
| 10   | Frontend    | Onboarding        | Full onboarding flow                    |
| 11   | Backend     | Reminders         | Push notification system                |
| 12   | Testing     | QA & Polish       | Bug fixes, performance tuning           |

---

## 🛠 Tech Stack Additions

| Category          | Phase 1  | Phase 2 Additions                        |
| ----------------- | -------- | ---------------------------------------- |
| **AI/ML**         | -        | Gemini 2.5 Flash Light, Perplexity Sonar |
| **Analytics**     | -        | PostHog                                  |
| **Storage**       | Supabase | + SQLite (offline), AsyncStorage         |
| **Notifications** | -        | Expo Push Notifications                  |
| **Feedback**      | -        | User Jot                                 |
| **Animations**    | -        | Lottie                                   |

### New Dependencies

**Backend:**

```txt
google-generativeai>=0.5.0  # Gemini API
httpx>=0.27.0               # For Perplexity API calls
posthog>=3.0.0              # Analytics
apscheduler>=3.10.0         # Reminder scheduling
```

**Frontend:**

```json
{
  "posthog-react-native": "^3.0.0",
  "expo-sqlite": "~13.0.0",
  "lottie-react-native": "6.7.0",
  "expo-notifications": "~0.27.0"
}
```

---

## 📝 Notes

### Cost Considerations

| Operation                     | Estimated Cost   | Frequency          |
| ----------------------------- | ---------------- | ------------------ |
| Photo analysis (Gemini)       | ~$0.0005/image   | Per photo upload   |
| Nutrition lookup (Perplexity) | ~$0.001/query    | Per new food entry |
| Edit classification (Gemini)  | ~$0.0002/request | Per edit request   |

**Cost Optimization Strategies:**

1. Cache nutrition data for repeated foods
2. Use lightweight model for classification
3. Reuse saved meal data (no AI call)
4. Batch classification requests when possible

### Privacy & Data

- All food photos stored in Supabase Storage (private bucket)
- AI descriptions not retained beyond processing
- User can delete all food log data
- GDPR export includes food entries

---

## 🚀 Getting Started with Phase 2

```bash
# 1. Pull latest code
git checkout main
git pull origin main

# 2. Run database migrations
cd backend
python -m alembic upgrade head

# 3. Update environment variables
# Add new API keys to .env files

# 4. Install new dependencies
pip install -r requirements.txt
cd ../frontend
npm install

# 5. Start development
cd ../backend
uvicorn app.main:app --reload

# In new terminal
cd frontend
npx expo start
```

---

<p align="center">
  <b>BiteCheck Phase 2</b> — Smarter Food Tracking, Powered by AI
</p>

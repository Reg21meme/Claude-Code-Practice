# DealScope

This is a real product-style project I built primarily through Claude Code, using a prompt-driven workflow to plan, generate, refine, and ship the app step by step.

DealScope is a local-first real estate deal analyzer for long-term rental and house-hack properties. It helps you model deals quickly, compare multiple scenarios, and understand whether a property actually works before you buy it.

## What it does

DealScope lets you:

- analyze a rental property with realistic assumptions
- model financing, renovation, rent, vacancy, and operating expenses
- compare **3 scenarios** side by side:
  - Base Case
  - Optimistic
  - Conservative
- instantly view key investment metrics:
  - monthly payment
  - monthly cash flow
  - annual cash flow
  - cap rate
  - cash-on-cash ROI
  - DSCR
  - total cash needed

The goal is to replace messy spreadsheets with a cleaner, faster, more visual workflow.

## Why I built it

I wanted to build something that felt like actual software, not just a tutorial app.

Most beginner projects are too simple to feel useful. I wanted a project with:

- real business value
- meaningful calculations
- multiple user flows
- clean UI
- structured architecture
- room to grow into a full product

Real estate deal analysis was a strong fit because it combines forms, calculations, validation, comparison views, and reporting in one app.

## Built with Claude Code

This project was developed in a step-by-step Claude Code workflow.

Instead of dumping one giant prompt and hoping for the best, I built it in phases:

1. logic foundation
2. single-scenario analyzer UI
3. three-scenario comparison
4. persistence/dashboard work
5. PDF export planned next

That workflow made it easier to keep the code organized, review each change, and avoid turning the project into AI-generated spaghetti.

## Current feature set

### Implemented
- landing page
- analyzer page
- property details form
- financing assumptions
- renovation assumptions
- rental assumptions
- operating expense assumptions
- live calculation updates
- three-scenario comparison
- responsive UI
- separated calculation and validation logic

### In progress / planned
- local persistence and saved deals dashboard
- PDF export
- advanced reporting
- more strategy presets like Airbnb and BRRRR

## Tech stack

- **Next.js**
- **React**
- **TypeScript**
- **Tailwind CSS**

## Project structure

```text
src/
  app/
    page.tsx
    analyze/
      page.tsx

  components/
    analyze/
    shared/

  lib/
    calculators/
    validators/

  types/

## Architecture notes

A big goal of this project was keeping the logic clean.

- calculation logic lives in pure TypeScript utility files
- validation logic is separated from UI
- UI components stay focused on rendering and interaction
- analyzer behavior is built in phases instead of all at once

## Key formulas included

DealScope currently calculates:

- loan amount
- mortgage payment
- total cash needed
- effective monthly rent
- operating expenses
- NOI
- monthly cash flow
- annual cash flow
- cap rate
- cash-on-cash ROI
- DSCR

## Running locally

```bash
npm install
npm run dev
  
Then open:
``` bash
http://localhost:3000
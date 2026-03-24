# Planning Guide

A factory floor planning and optimization tool that enables users to design production layouts, configure manufacturing bays as static builds or flow lines, and calculate throughput with intelligent scheduling.

**Experience Qualities**:
1. **Precise** - Users should feel confident in the accuracy of calculations and the reliability of their production schedules
2. **Visual** - The spatial layout of the factory floor should be immediately understandable with clear visual differentiation between bay types and flow connections
3. **Analytical** - Complex production data should be presented in digestible, actionable insights that drive optimization decisions

**Complexity Level**: Complex Application (advanced functionality, likely with multiple views)
This application requires sophisticated state management for grid-based layouts, flow line connections, timing calculations, throughput analytics, and multi-dimensional scheduling - far beyond a simple CRUD interface.

## Essential Features

### Grid-based Factory Floor Layout
- **Functionality**: Interactive grid where users can select and configure individual bays as production zones
- **Purpose**: Provides spatial visualization of the factory floor and serves as the foundation for all planning activities
- **Trigger**: User loads the application or creates a new factory layout
- **Progression**: View empty grid → Click/drag to select bays → Choose bay type (static/flow) → Configure bay parameters → Save layout
- **Success criteria**: Users can create, modify, and persist custom factory layouts with multiple bay configurations

### Static Build Bay Configuration
- **Functionality**: Mark individual bays as independent production stations with cycle time settings
- **Purpose**: Represent workstations that produce complete units independently without sequential dependencies
- **Trigger**: User selects a bay and chooses "Static Build" type
- **Progression**: Select bay → Set as static build → Enter product name → Define cycle time → Configure capacity → View in grid with distinct styling
- **Success criteria**: Static bays display their configuration, calculate independent throughput, and persist settings

### Flow Line Configuration
- **Functionality**: Connect multiple adjacent bays into a sequential production line with station-specific timings
- **Purpose**: Model assembly lines where products move through sequential stations, each adding value
- **Trigger**: User selects multiple connected bays and chooses "Flow Line" type
- **Progression**: Select first bay → Extend selection to adjacent bays → Set as flow line → Name the line → Configure timing for each station → Define takt time → Visualize flow direction
- **Success criteria**: Flow lines visually show connections between bays, display flow direction, and calculate bottlenecks based on station timings

### Throughput Calculation Engine
- **Functionality**: Real-time calculation of production capacity based on bay configurations and timings
- **Purpose**: Provide quantitative insights into factory performance to identify constraints and optimization opportunities
- **Trigger**: Automatically recalculates when any bay configuration changes
- **Progression**: User modifies bay settings → System recalculates → Display updated throughput metrics → Highlight bottlenecks → Show daily/weekly/monthly projections
- **Success criteria**: Accurate throughput calculations for both static builds and flow lines, with clear identification of limiting factors

### Production Scheduling Interface
- **Functionality**: Assign production orders to specific bays or flow lines with timing visualization
- **Purpose**: Enable planning of actual production runs with conflict detection and capacity validation
- **Trigger**: User creates a new production schedule or assigns an order
- **Progression**: Create production order → Specify quantity and product → Assign to bay/flow line → Set start date → System validates capacity → Display on timeline → Detect conflicts → Confirm schedule
- **Success criteria**: Users can create schedules, visualize timeline utilization, and receive alerts about capacity conflicts or overruns

## Edge Case Handling

- **Disconnected Flow Bays**: If user attempts to create a flow line with non-adjacent bays, show validation message and highlight required connection path
- **Conflicting Schedules**: When production orders overlap on the same bay, display warning with conflict visualization and suggest alternative timing
- **Zero Timing Values**: Prevent users from setting zero or negative cycle times; show inline validation with minimum value guidance
- **Empty Factory Floor**: Display helpful onboarding state with suggested actions when no bays are configured
- **Maximum Grid Size**: Limit factory floor to reasonable dimensions (e.g., 20x20) to maintain performance and usability
- **Flow Line Direction Changes**: When flow lines turn corners, automatically determine and display flow direction arrows
- **Partial Schedule Deletion**: When deleting a bay that has active schedules, show confirmation dialog with impact summary

## Design Direction

The design should evoke precision manufacturing and industrial engineering - clean, structured, and data-forward. The interface should feel like a professional planning tool used by operations managers, with the satisfaction of fitting puzzle pieces together efficiently. Visual hierarchy should emphasize the grid layout while providing rich contextual information without overwhelming the user.

## Color Selection

An industrial-technical palette that balances the clinical precision of manufacturing with the warmth of productive activity.

- **Primary Color**: Deep industrial blue `oklch(0.45 0.12 250)` - Communicates technical precision and reliability, used for primary actions and selected states
- **Secondary Colors**: 
  - Warm amber `oklch(0.75 0.15 70)` for static build bays - Suggests independent, self-contained production
  - Cool cyan `oklch(0.70 0.12 200)` for flow line bays - Indicates movement and sequential flow
- **Accent Color**: Vibrant orange `oklch(0.68 0.20 45)` - High-energy color for CTAs, alerts, and throughput metrics that demand attention
- **Foreground/Background Pairings**: 
  - Background (Light gray `oklch(0.98 0.005 250)`): Dark text `oklch(0.25 0.02 250)` - Ratio 12.8:1 ✓
  - Primary Blue `oklch(0.45 0.12 250)`: White text `oklch(0.99 0 0)` - Ratio 8.2:1 ✓
  - Accent Orange `oklch(0.68 0.20 45)`: White text `oklch(0.99 0 0)` - Ratio 4.6:1 ✓
  - Static Amber `oklch(0.75 0.15 70)`: Dark text `oklch(0.25 0.02 250)` - Ratio 6.1:1 ✓

## Font Selection

Typography should reflect engineering precision while remaining highly readable for extended planning sessions.

- **Primary Font**: JetBrains Mono - Monospaced font that brings technical credibility and ensures numerical alignment in tables and timings
- **Secondary Font**: Space Grotesk - Geometric sans-serif for headings and labels that complements the technical aesthetic without being overly mechanical

**Typographic Hierarchy**:
- H1 (Page Title): Space Grotesk Bold/32px/tight letter spacing (-0.02em)
- H2 (Section Headers): Space Grotesk Semibold/24px/normal spacing
- H3 (Bay Labels): Space Grotesk Medium/18px/normal spacing
- Body (Configuration panels): Space Grotesk Regular/14px/1.5 line height
- Data (Timings, metrics): JetBrains Mono Medium/13px/1.4 line height/tabular numbers
- Labels (Form fields): Space Grotesk Medium/12px/0.01em letter spacing/uppercase

## Animations

Animations should reinforce the mechanical, precise nature of factory planning while maintaining snappy, professional interactions. Bay selection should feel tactile with subtle scale and shadow changes. Flow line connections should animate briefly to show directionality when created. Throughput calculations should pulse gently when updated to draw attention. Schedule conflicts should shake subtly to indicate validation errors. All interactions should complete within 200-300ms to maintain the sense of a responsive, professional tool.

## Component Selection

- **Components**: 
  - Grid: Custom component using CSS Grid for factory floor layout with cell selection
  - Dialog: Shadcn Dialog for bay configuration modals
  - Tabs: Shadcn Tabs for switching between Layout, Throughput, and Schedule views
  - Card: Shadcn Card for displaying metrics summaries and bay details
  - Input: Shadcn Input for cycle time entry with numeric validation
  - Select: Shadcn Select for product type and bay type selection
  - Button: Shadcn Button with clear hierarchy (primary for save, secondary for cancel)
  - Badge: Shadcn Badge for displaying bay status and flow line identifiers
  - Separator: Shadcn Separator for dividing sections in configuration panels
  - Tooltip: Shadcn Tooltip for showing quick bay information on hover
  - Sheet: Shadcn Sheet for sliding configuration panel from right side
  - Calendar: Shadcn Calendar for scheduling date selection
  - Table: Shadcn Table for schedule list view and throughput reports
  
- **Customizations**: 
  - Factory Grid Cell: Custom component with hover states, selection states, and bay type styling
  - Flow Connector: SVG-based component drawing lines between connected bays with directional arrows
  - Timeline Scheduler: Custom Gantt-style timeline component for visualizing production schedules
  - Throughput Gauge: Custom D3-based visualization for capacity utilization
  
- **States**: 
  - Grid cells: default (empty), hover (border highlight), selected (border + background tint), configured (colored by type)
  - Buttons: Primary (filled blue), hover (darker blue), active (pressed effect), disabled (muted gray)
  - Inputs: focused (ring + border color), error (red ring + error text), valid (subtle green indicator)
  - Bays: empty, static (amber fill), flow (cyan fill with connection lines), scheduled (pattern overlay)
  
- **Icon Selection**: 
  - Plus (add bay, create schedule)
  - Factory (main app icon)
  - Flow Arrow (flow line direction)
  - Gear/Wrench (bay configuration)
  - Clock (timing settings)
  - Calendar (scheduling)
  - ChartBar (throughput view)
  - Grid (layout view)
  - Trash (delete)
  - Check (confirm)
  - X (close, cancel)
  
- **Spacing**: 
  - Card padding: p-6
  - Button padding: px-4 py-2
  - Section gaps: gap-6
  - Grid cell gaps: gap-1
  - Form field spacing: space-y-4
  - Page margins: p-8
  
- **Mobile**: 
  - Grid view switches to scrollable horizontal/vertical pan with pinch-to-zoom
  - Configuration panels use full-screen Sheet instead of side panel
  - Tabs become dropdown selector to save vertical space
  - Metrics cards stack vertically
  - Timeline becomes vertical orientation for better mobile readability
  - Touch targets expanded to minimum 44px for bay selection
  - Bottom navigation bar for primary view switching (Layout/Throughput/Schedule)

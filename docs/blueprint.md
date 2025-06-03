# **App Name**: Estate Envision

## Core Features:

- Property Listing Display: Display property listings in a user-friendly format with key details like price, location, and number of bedrooms. Use pagination to navigate large datasets.
- Sortable Listings: Enable users to sort listings based on price, location, and other relevant criteria.
- Advanced Filtering: Users can filter listings by price range, location, number of bedrooms, and other attributes via a streamlined interface. The url updates when users select different filtering criteria.
- AI-Powered Description Generation: Utilize generative AI to create catchy property descriptions from basic details. This feature will act as a tool to populate the descriptions automatically from key property features.
- Favorites Management: Enable users to save favorite properties for later viewing and management in a dedicated section.
- CSV Import: Import property data from a CSV file.
- User authentication (email/password): Implement user registration and login with email and password.
- Redis caching: Integrate Redis caching to optimize frequent read/write operations.
- Ownership-based property CRUD: Implement CRUD operations for properties with ownership-based restrictions.
- Property recommendation system: Implement a system for users to recommend properties to other registered users.

## Style Guidelines:

- Primary Color: #468B97 – A refined blue that conveys trust and professionalism. Used for navigation bars, headers, and action buttons (e.g., “Contact Agent”).
- Background Color: #F0F4F5 – A subtle blue-gray that keeps the layout light and airy, ideal for highlighting visual content like property cards.
- Accent Color: #64CCC5 – A vibrant teal used for interactive elements like filters, hover effects, and “Save to Favorites” buttons.
- Dynamic Tag Colors: Use the `colorTheme` field in the dataset to visually differentiate property tags (e.g., `lake-view`, `gated-community`), using a consistent badge design.
- Font Family: A modern, legible sans-serif such as Inter, Open Sans, or Roboto.
- Hierarchy Guidelines: Titles (`title` field): Bold, 20–24px, used prominently on cards and detail pages. Labels & Attributes (e.g., area, bedrooms): Medium, 14–16px with icons. Price & Availability: Highlighted using larger text or accent colors. Tags & Amenities: Smaller, all-caps or badges for quick scanning.
- Card-Based Layout: Use elevated cards with soft shadows and rounded corners to display each property. Include: Property `title`, `type`, and thumbnail. Badges for `tags` and `amenities`. Quick info (price, bedrooms, bathrooms, area). CTA buttons (e.g., Save, Contact, Recommend)
- Grid System: Responsive 12-column grid to support listings across devices.
- Property Detail Page: Structured layout with: Carousel or image grid. Sections: Overview, Amenities, Location, Ratings & Reviews
- Use minimal and consistent icons (Lucide/Heroicons recommended) for: 🛏️ `bedrooms`, 🛁 `bathrooms`, 📐 `areaSqFt`, 🏷️ `price`, 📍 `city` / `state`, 🧰 `amenities` (map these dynamically), 🕓 `availableFrom`, 🔒 `isVerified` (use a shield or checkmark icon)
- Buttons: Rounded, with hover states using accent colors.
- Filters: Styled dropdowns, sliders, and checkboxes with badge summaries.
- Favorites & Recommendations: Heart icons toggle saved state with animation. Property recommendation uses modal with email search and status feedback.
- High contrast for readability across all backgrounds.
- All icons and controls should have tooltips or ARIA labels.
- Responsive layout with mobile-first design.
- Ensure clear focus indicators for all interactive elements.
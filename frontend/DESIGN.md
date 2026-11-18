# Campusly design rules (must follow on every page)

The UI is the most important part of this project. Every page must look polished,
modern and eye-catching, with smooth interactions.

## Colours: only these three (plus their shades in src/index.css)
| Name | Hex | Share | Use for |
|---|---|---|---|
| Butter Cream | #F4EAD5 | 60% | page background, cards, surfaces |
| Forest Green | #1E3B2F | 30% | text, headings, navbar/sidebar, dark sections |
| Hot Pink | #FF3EA5 | 10% | primary buttons, highlights, badges, active states |

No other hues (no blue, red, plain grey). White is allowed only for text on pink/forest.
Status colours come from the palette too: approved/shortlisted = forest,
pending = cream-600/700, rejected/not shortlisted = hotpink-700.

## Type
- Headings: Fraunces (`font-display`), bold, with an italic hot-pink word for emphasis.
- Body: Inter (`font-sans`).

## Feel
- Rounded corners (xl to 3xl), soft forest-tinted shadows (`shadow-soft`, `shadow-lift`).
- Pink buttons get `shadow-glow` and lift slightly on hover.
- Hover/focus transitions on everything clickable; skeleton loaders, friendly empty states.
- Toasts: `sonner`, styled to the theme, top-centre.

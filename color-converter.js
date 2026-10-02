// Use dynamic import for oklch-color if available, otherwise just print a node script that uses built-in features to approximate or we can just use the hex codes directly in the CSS since modern browsers and Tailwind v4 support hex and any other format fine in raw CSS variables.
// Actually, Tailwind v4 allows passing raw hex directly to variables:
// --background: #F8FAFC;
// Let's just output the exact CSS blocks.
console.log(`
Light mode:
--background: #F8FAFC;
--foreground: #0F172A;
--card: #FFFFFF;
--card-foreground: #0F172A;
--primary: #0D9488;
--primary-foreground: #FFFFFF;
--secondary: #2563EB;
--secondary-foreground: #FFFFFF;
--muted: #F1F5F9;
--muted-foreground: #64748B;
--border: #E2E8F0;
--input: #E2E8F0;
--ring: #0D9488;

--destructive: #EA580C;
--destructive-foreground: #FFFFFF;
`);

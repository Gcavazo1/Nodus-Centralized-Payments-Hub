# Nodus Payment Hub Template 💸

> A fully customizable, developer-first Next.js template for building a centralized payment processing hub. Supports Stripe (Cards, Apple Pay), Coinbase Commerce (Crypto), and Firebase for quotes/admin features.

---

## ✨ Key Features

- 🔐 **Secure Stripe Checkout:** Handles Cards, Apple Pay, Google Pay.
- ₿ **Crypto-Friendly:** Optional Coinbase Commerce integration for BTC/ETH payments.
- 🧾 **Custom Quotes:** Built-in quote request form storing submissions in Firestore.
- 👤 **Admin Dashboard:** Manage site settings, social links, and view quote submissions (requires Firebase Auth).
- 🎨 **Configurable Offerings:** Define digital products and services in `src/config/offerings.ts`.
- 📧 **Email Confirmations:** Optional integration with Resend for payment/quote confirmations.
- 🧱 **Component-Based:** Built with shadcn/ui, Tailwind CSS, and reusable components.
- 📱 **Responsive Design:** Mobile-first layout with drawer navigation.
- 🌗 **Dark/Light Mode:** Theme support via `next-themes`.
- 🔗 **Dynamic Footer Links:** Manageable through the admin panel.
- ☁️ **Deploy-Ready:** Optimized for Vercel (frontend) and Firebase (backend/DB).

---

## 🛠 Tech Stack

| Layer         | Tool/Service         | Purpose                          |
| ------------- | -------------------- | -------------------------------- |
| Frontend      | Next.js (App Router) | Modern, scalable React framework |
| UI            | Tailwind CSS         | Utility-first CSS styling        |
| Components    | shadcn/ui            | Reusable UI components           |
| Hosting       | Vercel (Recommended) | CI/CD, Preview Deployments       |
| Payments      | Stripe               | Card, Wallet Payments            |
|               | Coinbase Commerce    | Cryptocurrency Payments          |
| Backend DB    | Firebase Firestore   | Quote Submissions, Admin Data    |
| Auth (Admin)  | Firebase Auth        | Secure Admin Panel Access        |
| Emails (Opt.) | Resend               | Transactional Emails             |

---

## 🚀 Getting Started (Local Development)

1. **Clone:**

   ```bash
   git clone https://github.com/your-github-username/nodus-payment-hub.git # Replace with your repo URL
   cd nodus-payment-hub
   ```
2. **Install Dependencies:**

   ```bash
   npm install
   # or yarn / pnpm
   ```
3. **Environment Variables:**

   - Copy `.env.example` to `.env.local`.
   - Fill in your required keys for Firebase, Stripe, and optionally Coinbase/Resend.

   ```bash
   cp .env.example .env.local
   # Now edit .env.local with your keys
   ```

   *(**Note:** `NEXT_PUBLIC_` variables are exposed client-side. Keep secret keys without the prefix.)*
4. **Run Development Server:**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

---

## 🧱 Architecture Overview

This template uses the Next.js App Router structure:

```plaintext
/
├── public/             # Static assets
├── src/
│   ├── app/            # App Router (pages, layouts, API routes)
│   ├── components/       # Reusable UI components (shadcn/ui based)
│   ├── config/           # Site config (metadata, offerings, navigation)
│   ├── lib/              # Utilities, hooks, service clients (Stripe, Firebase, etc.)
│   ├── styles/           # Global CSS
│   └── types/            # TypeScript definitions
├── functions/          # Firebase Cloud Functions (if used)
├── docs/               # End-user documentation (separate from this README)
├── scripts/            # Utility scripts (e.g., create-admin-user.js)
├── .env.example        # Environment variable template
├── next.config.mjs     # Next.js config (CSP headers here)
├── tailwind.config.js  # Tailwind config
├── firebase.json       # Firebase hosting/functions config
├── firestore.rules     # Firestore security rules
└── package.json        # Dependencies & scripts
```

**Key Principles:**

* **Configuration-Driven:** Easily update site info, products, and services in `src/config/`.
* **Component-Based UI:** Leverages `shadcn/ui` for accessible and customizable components.
* **Server/Client Separation:** Follows Next.js App Router conventions.
* **Isolated Service Logic:** Stripe, Firebase, Coinbase interactions are in `src/lib/`.

---

## 🔧 Customization

- **Offerings:** Modify `src/config/offerings.ts`.
- **Site Info:** Edit `src/config/site.ts`.
- **Styling:** Update `tailwind.config.js` and global CSS. Theme variables are often tied to `shadcn/ui` setup.
- **Admin Panel:** Access requires setting up Firebase Auth and creating an admin user (see `scripts/create-admin-user.js`).
- **Background Images:** Replace `light-background.jpg` / `dark-background.jpg` in `/public` and adjust opacity in `src/app/layout.tsx`.

*(Refer to the documentation in the `/docs` folder for more detailed customization guides.)*

---

## ☁️ Deployment

- **Frontend:** Deploy seamlessly to [Vercel](https://vercel.com/) by connecting your GitHub repository.
- **Backend/DB:** Firebase services (Firestore, Auth) are used. Ensure Firestore rules (`firestore.rules`) are deployed.
- **Environment Variables:** Add your production environment variables to your Vercel project settings.
- **Webhooks:** Configure Stripe and Coinbase webhook endpoints in their respective dashboards to point to your deployed API routes (e.g., `https://yourdomain.com/api/stripe/webhook`). Ensure webhook secrets are set in your production environment variables.

---

## ⚠️ Security Note: Coinbase SDK

The `coinbase-commerce-node` SDK may report dependency vulnerabilities (`npm audit`). Evaluate the risk based on your usage and consider alternatives if concerned.

---

## 📈 Roadmap

- [X] Admin Dashboard Foundation
- [X] Responsive Design & Mobile Nav
- [X] Dynamic Footer Links
- [X] License Key Generation / Digital Delivery
- [X] Optional CMS Integration (Contentful, Sanity)
- [X] Enhanced Email Automation
- [ ] Additional Payment Gateways (Square, PayPal)
- [ ] BNPL Integration (Stripe Afterpay/Klarna)

---

## 📄 License

*(Consider adding a specific license file, e.g., `LICENSE.md`, and referencing it here. Example: This project is licensed under the [MIT License](LICENSE.md).)*

*(If this is a private repo for a commercial product, you might omit the License section or state that usage is governed by purchase terms.)*

export type NavItem = {
  title: string;
  href: string;
  description?: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
};

export type MainNavItem = NavItem;

export type FooterItem = {
  title: string;
  items: NavItem[];
};

export type SidebarNavItem = {
  title: string;
  disabled?: boolean;
  external?: boolean;
  icon?: string;
  href?: string;
  items?: SidebarNavItem[];
};

export const mainNavItems: MainNavItem[] = [
  {
    title: "Home",
    href: "/",
  },
  {
    title: "Products",
    href: "/#products",
    description: "Digital products and templates for your projects",
  },
  {
    title: "Services",
    href: "/#services",
    description: "Professional development and consultation services",
  },
  {
    title: "Request Quote",
    href: "/quote",
    description: "Get a custom quote for your project",
  },
];

export const footerItems: FooterItem[] = [
  {
    title: "Products",
    items: [
      {
        title: "Website Templates",
        href: "/#website-templates",
      },
      {
        title: "E-commerce Solutions",
        href: "/#ecommerce",
      },
      {
        title: "All Products",
        href: "/#products",
      },
    ],
  },
  {
    title: "Services",
    items: [
      {
        title: "Web Development",
        href: "/#web-development",
      },
      {
        title: "UI/UX Consultation",
        href: "/#design-consultation",
      },
      {
        title: "Custom Projects",
        href: "/quote",
      },
    ],
  },
  {
    title: "Resources",
    items: [
      {
        title: "Documentation",
        href: "/docs",
        disabled: true,
      },
      {
        title: "FAQs",
        href: "/faqs",
        disabled: true,
      },
      {
        title: "Blog",
        href: "/blog",
        disabled: true,
      },
    ],
  },
  {
    title: "Legal",
    items: [
      {
        title: "Privacy Policy",
        href: "/privacy",
        disabled: true,
      },
      {
        title: "Terms of Service",
        href: "/terms",
        disabled: true,
      },
    ],
  },
];

export const sidebarNavItems: SidebarNavItem[] = [
  {
    title: "Getting Started",
    items: [
      {
        title: "Introduction",
        href: "/docs",
        disabled: true,
      },
      {
        title: "Installation",
        href: "/docs/installation",
        disabled: true,
      },
    ],
  },
  {
    title: "Documentation",
    items: [
      {
        title: "Product Usage",
        href: "/docs/products",
        disabled: true,
      },
      {
        title: "API Reference",
        href: "/docs/api",
        disabled: true,
      },
    ],
  },
]; 
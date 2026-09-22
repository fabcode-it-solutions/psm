"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import {
  LayoutDashboard,
  Package,
  FolderTree,
  Settings2,
  Layers,
  ChevronDown,
  Bell,
  CarFront,
  CarIcon,
  SlidersHorizontal,
  PlusCircle,
  Image as ImageIcon,
  UserIcon,
  MessageCircleWarning,
  Flag,
  ShieldCheck,
  Users,
  ReceiptText,
} from "lucide-react";
import * as Collapsible from "@radix-ui/react-collapsible";
import { useState , useEffect } from "react";
import { IoArrowBack } from "react-icons/io5";

type MenuItems = {
  title: string;
  href?: string;
  icon?: React.ReactNode;
  isActive?: boolean;
  children?: {
    title: string;
    href: string;
    icon?: React.ReactNode;
    isActive?: boolean;
  }[];
};
export function AdminSidebar() {
  const pathname = usePathname();
  // const [catalogOpen, setCatalogOpen] = useState<string[]>([
  //   // "Brands & Models",
  //   // "Parts",
  //    "Parts & Listings",
  //   "Brands & Models",
  //   "Moderation & Risk",
  //   "System & Settings",
  // ]);

  const [openSection, setOpenSection] = useState<string | null>(null);

  const menuItems: MenuItems[] = [

    {
      title: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="w-4 h-4" />,
    },
    {
      title: "Orders",
      href: "/dashboard/orders",
      icon: <ReceiptText className="w-4 h-4" />,
    },
    {
      title: "Listings",
      href: "/dashboard/parts",
      icon: <Package className="w-4 h-4" />,
    },
    {
      title: "Users",
      href: "/dashboard/users",
      icon: <Users className="w-4 h-4" />,
    },
    {
      title: "Reports",
      href: "/dashboard/reports",
      icon: <MessageCircleWarning className="w-4 h-4" />,
    },
    {
      title: "Parts & Categories",
      icon: <Package className="w-4 h-4" />,
      children: [
        {
          title: "Create New Master Part",
          href: "/dashboard/parts/create",
          icon: <PlusCircle className="w-4 h-4" />,
        },
        {
          title: "Categories & Tags",
          href: "/dashboard/categories",
          icon: <FolderTree className="w-4 h-4" />,
        },
        {
          title: "Brands",
          href: "/dashboard/brands",
          icon: <CarFront className="w-4 h-4" />,
        },
         {
          title: "Models",
          href: "/dashboard/models",
          icon: <CarIcon className="w-4 h-4" />,
        },
        {
          title: "Manufacturers",
          href: "/dashboard/manufacturers",
          icon: <CarIcon className="w-4 h-4" />,
        },
        {
          title: "Types",
          href: "/dashboard/types",
          icon: <SlidersHorizontal className="w-4 h-4" />,
        },
      ],
    },

    // Moderation & Risk
    {
      title: "Moderation & Risk",
      children: [
        {
          title: "Flagged Items",
          href: "/dashboard/flagged",
          icon: <Flag className="w-4 h-4" />,
        },
        {
          title: "Disputes & Refunds",
          href: "/dashboard/disputes",
          icon: <MessageCircleWarning className="w-4 h-4" />,
        },
        {
          title: "Verification Queue",
          href: "/dashboard/verification",
          icon: <ShieldCheck className="w-4 h-4" />,
        },
      ],
    },

    // System Settings
    {
      title: "System & Settings",
      children: [
        {
          title: "Media Library",
          href: "/dashboard/media",
          icon: <ImageIcon className="w-4 h-4" />,
        },
        {
          title: "Notifications",
          href: "/dashboard/notifications",
          icon: <Bell className="w-4 h-4" />,
        },
        {
          title: "Metafields",
          href: "/dashboard/metafields",
          icon: <Settings2 className="w-4 h-4" />,
        },
      ],
    },
  ];
   useEffect(() => {
    // Find parent menu which contains the current route
    const parent = menuItems.find((item) =>
      item.children?.some((child) => pathname.startsWith(child.href))
    );

    if (parent) {
      setOpenSection(parent.title);
    }
  }, [pathname]);
  return (
    <aside className="w-64 bg-dark-100 border-r border-gray-5/20 max-tab-lg:hidden">
      <div className="flex flex-col h-full max-h-dvh sticky top-0">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-gray-5/20">
          <Link
            href="/"
            className=" font-sofia-sans text-sm text-accent-100 flex items-center gap-1"
          >
            <IoArrowBack /> Go Back
          </Link>
          <div className="flex items-center gap-3 mt-6">
            <div className="w-10 h-10 bg-accent-100 rounded-lg flex items-center justify-center">
              <Layers className="w-6 h-6 text-dark-100" />
            </div>
            <div>
              <h1 className="text-light-100 font-audiowide text-xl">Admin</h1>
              <p className="text-gray-4 text-xs font-sofia-sans">
                Control Panel
              </p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        {/* <nav className="flex-1 px-4 py-6 overflow-y-auto">
          {menuItems.map((item, index) => (
            <div key={index} className={`${item.children ? "mb-0" : "mb-2"}`}>
              {item.children ? (
                <Collapsible.Root
                  open={openSection === item.title}
                  onOpenChange={() =>
                    setOpenSection(
                      openSection === item.title ? null : item.title
                    )
                  }
                >
                  <Collapsible.Trigger className="flex cursor-pointer items-center justify-between w-full px-2 mb-0 min-h-10 text-xs font-sofia-sans font-semibold text-gray-4 uppercase tracking-wider hover:text-light-100 transition-colors">
                    {item.title}
                    <ChevronDown
                      className={`
                      w-4 h-4 transition-transform
                      ${openSection === item.title && "rotate-180"}
                        `}
                    />
                  </Collapsible.Trigger>
                  <Collapsible.Content>
                    <div className="space-y-1 py-2 border-b border-gray-700">
                      {item.children.map((child) => {
                        const Icon = child.icon;
                        const isActive = pathname === child.href;

                        return (
                          <Link
                            key={child.href}
                            href={child.href}
                            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-sofia-sans text-sm transition-all
                           ${
                             isActive || child?.isActive
                               ? "bg-accent-100/10 text-accent-100 border-l-2 border-accent-100"
                               : "text-gray-4 hover:bg-gray-5/10 hover:text-light-100"
                           }
                            `}
                          >
                            {Icon}
                            {child.title}
                          </Link>
                        );
                      })}
                    </div>
                  </Collapsible.Content>
                </Collapsible.Root>
              ) : (
                <Link
                  href={item.href || ""}
                  className={`
                    flex items-center gap-3 px-3 py-2.5 rounded-lg font-sofia-sans text-sm transition-all
                   ${
                     pathname === item.href
                       ? "bg-accent-100/10 text-accent-100 border-l border-accent-100"
                       : "text-gray-4 hover:bg-gray-5/10 hover:text-light-100"
                   }
                  `}
                >
                  {item.icon}
                  {item.title}
                </Link>
              )}
            </div>
          ))}
        </nav> */}

        <nav className="flex-1 px-4 py-6 overflow-y-auto">
  {menuItems.map((item, index) => {
    const hasChildren = !!item.children;
    const isChildActive = hasChildren
      ? item.children?.some((child) => pathname.startsWith(child.href))
      : false;

    return (
      <div key={index} className={`${hasChildren ? "mb-1" : "mb-2"}`}>
        {hasChildren ? (
          <Collapsible.Root
            // open={openSection === item.title || isChildActive}
            open={openSection === item.title}
            onOpenChange={() =>
              setOpenSection(openSection === item.title ? null : item.title)
            }
          >
            <Collapsible.Trigger className="flex cursor-pointer items-center justify-between w-full px-2 mb-0 min-h-10 text-sm font-sofia-sans font-semibold text-gray-4 uppercase tracking-wider hover:text-light-100 transition-colors">
              {item.title}
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  openSection === item.title || isChildActive ? "rotate-180" : ""
                }`}
              />
            </Collapsible.Trigger>

            <Collapsible.Content>
              <div className="space-y-1 py-2 border-b border-gray-700">
                {item.children?.map((child) => {
                  const isActive = pathname === child.href;

                  return (
                    <Link
                      key={child.href}
                      href={child.href}
                      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-sofia-sans text-sm transition-all
                        ${
                          isActive
                            ? "bg-accent-100/10 text-accent-100 border-l-2 border-accent-100"
                            : "text-gray-4 hover:bg-gray-1/10 hover:text-light-100"
                        }`}
                    >
                      {child.icon}
                      {child.title}
                    </Link>
                  );
                })}
              </div>
            </Collapsible.Content>
          </Collapsible.Root>
        ) : (
          <Link
            href={item.href || ""}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg font-sofia-sans text-sm transition-all ${
              pathname === item.href
                ? "bg-accent-100/10 text-accent-100 border-l border-accent-100"
                : "text-gray-4 hover:bg-gray-1/10 hover:text-light-100"
            }`}
          >
            {item.icon}
            {item.title}
          </Link>
        )}
      </div>
    );
  })}
</nav>


        {/* User Profile */}
        <div className="p-4 border-t border-gray-5/20">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 bg-accent-100/20 rounded-full flex items-center justify-center">
              <span className="text-accent-100 text-sm font-bold">A</span>
            </div>
            <div className="flex-1">
              <p className="text-light-100 text-sm font-sofia-sans">
                Admin User
              </p>
              <p className="text-gray-4 text-xs">admin@example.com</p>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

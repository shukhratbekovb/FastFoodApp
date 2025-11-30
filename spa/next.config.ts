import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
	logging: {
		fetches: {
			fullUrl: true,
			hmrRefreshes: true,
		},
	},
	poweredByHeader: false,
	typedRoutes: true,
	output: "standalone",
	images: {
		qualities: [75, 100],
	},
	reactCompiler: true,
	experimental: {
		inlineCss: true,
		dynamicOnHover: true,
		turbopackFileSystemCacheForDev: true,
		optimizePackageImports: [
			"@radix-ui/react-accordion",
			"@radix-ui/react-alert-dialog",
			"@radix-ui/react-avatar",
			"@radix-ui/react-collapsible",
			"@radix-ui/react-dialog",
			"@radix-ui/react-dropdown-menu",
			"@radix-ui/react-label",
			"@radix-ui/react-separator",
			"@radix-ui/react-slot",
			"@radix-ui/react-tabs",
			"@radix-ui/react-tooltip",
			"class-variance-authority",
			"clsx",
			"lucide-react",
			"next",
			"nuqs",
			"react",
			"react-dom",
			"react-to-print",
			"tailwind-merge",
			"zustand"
		]
	},
	headers: async () => {
		return [
			{
				source: "/(.*)",
				headers: [
					{
						key: "X-Developed-By",
						value: "IT 911",
					},
				],
			},
			{
				source: "/:path*{/}?",
				headers: [
					{
						key: "X-Accel-Buffering",
						value: "no",
					},
				],
			}
		];
	},
};

export default nextConfig;

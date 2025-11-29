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

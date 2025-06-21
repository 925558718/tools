"use client";
import React from "react";
import Bugsnag from "@bugsnag/js";
import BugsnagPluginReact from "@bugsnag/plugin-react";
import BugsnagPerformance from "@bugsnag/browser-performance";

const apiKey = "1f49e6bbbc95fc6d47c946643799d62d"
if (typeof window !== "undefined") {
	Bugsnag.start({
		apiKey,
		plugins: [new BugsnagPluginReact()],
	});
	BugsnagPerformance.start({ apiKey });
	console.log("Bugsnag initialized");
}

const ErrorBoundary = typeof window !== "undefined" ? Bugsnag?.getPlugin("react")?.createErrorBoundary(React) : null;

const BugsnagErrorBoundary = ({ children }: { children: React.ReactNode }) => {
	// 如果ErrorBoundary未定义，直接返回children
	if (!ErrorBoundary) {
		return <>{children}</>;
	}
	return <ErrorBoundary>{children}</ErrorBoundary>;
};

export default BugsnagErrorBoundary;
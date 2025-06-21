import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import HomePageContent from "./HomePageContent";

export async function generateMetadata({
	params,
}: { params: { locale: string } }): Promise<Metadata> {
	const t = await getTranslations();
console.log(t("logo_subtitle"))
	const appName = t("structured_data_app_name") || "Developer Tools";
	const appDescription =
		t("structured_data_description") ||
		"Free online developer tools for software development";
	const featureList = t.raw("structured_data_features") || [
		"CSS Tools",
		"Code Generators",
		"Development Utilities",
	];

	return {
		title: appName,
		description: appDescription,
	};
}

export default async function HomePage() {
	return (
		<>
			<HomePageContent />
		</>
	);
}

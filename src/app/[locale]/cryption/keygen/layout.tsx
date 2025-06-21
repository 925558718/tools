import { Metadata } from "next";
import { getTranslations } from "next-intl/server";

export async function generateMetadata(): Promise<Metadata> {
	const t = await getTranslations("keygen");

	return {
		title: t("metadata.title"),
		description: t("metadata.description"),
	};
}

export default function KeygenLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return <>{children}</>;
}

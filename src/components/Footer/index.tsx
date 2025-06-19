"use client"
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

function Footer() {
	const t = useTranslations();
	return (
		<footer className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/50 shadow-lg shadow-black/5">

		</footer>
	);
}

export default Footer;

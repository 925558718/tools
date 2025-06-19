"use client"
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

function Footer() {
	const t = useTranslations();
	return (
		<footer className="w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-t border-white/20 dark:border-slate-700/50 shadow-lg shadow-black/5">
			<div className="container mx-auto px-4 py-8">
				<div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
					<div className="text-center md:text-left">
						<p className="text-sm text-muted-foreground">
							{t('footer_copyright')}
						</p>
						<p className="text-xs text-muted-foreground/70 mt-1">
							{t('footer_description')}
						</p>
					</div>
					
					<div className="flex items-center space-x-6">
						<Link href="/" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
							{t('nav_home')}
						</Link>
						<Link href="/css/gradient" className="text-sm text-muted-foreground hover:text-foreground transition-colors">
							{t('nav_gradient_generator')}
						</Link>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default Footer;

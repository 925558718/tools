"use client"
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { ExternalLink, Image, Palette, Code, Globe } from 'lucide-react';

function Footer() {
	const t = useTranslations();
	
	// limgx.com域名下的其他网站服务
	const limgxServices = [
		{
			name: "limgx.com",
			descriptionKey: "footer_service_main",
			url: "https://limgx.com",
			icon: Image,
			color: "text-primary"
		},
		{
			name: "tools.limgx.com", 
			descriptionKey: "footer_service_tools",
			url: "https://tools.limgx.com",
			icon: Code,
			color: "text-secondary"
		},
	];

	return (
		<footer className="w-full bg-background/95 backdrop-blur-xl border-t border-primary/20 dark:border-primary/30 shadow-lg shadow-primary/5">
			<div className="container mx-auto px-4 py-8">
				{/* 主要服务展示区域 */}
				<div className="mb-8">
					<h3 className="text-lg font-semibold text-foreground mb-4 text-center">
						{t('footer_services_title')}
					</h3>
					<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
						{limgxServices.map((service) => {
							const IconComponent = service.icon;
							return (
								<a
									key={service.name}
									href={service.url}
									target="_blank"
									rel="noopener noreferrer"
									className="group flex items-center space-x-3 p-3 rounded-lg bg-card/30 border border-border/30 hover:bg-card/50 hover:border-primary/30 hover:shadow-md hover:shadow-primary/10 transition-all duration-200"
								>
									<div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors duration-200">
										<IconComponent className={`w-5 h-5 ${service.color}`} />
									</div>
									<div className="flex-1 min-w-0">
										<p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors duration-200 truncate">
											{service.name}
										</p>
										<p className="text-xs text-muted-foreground truncate">
											{t(service.descriptionKey)}
										</p>
									</div>
									<ExternalLink className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors duration-200 opacity-0 group-hover:opacity-100" />
								</a>
							);
						})}
					</div>
				</div>

				{/* 分隔线 */}
				<div className="border-t border-border/30 mb-6" />

				{/* 底部信息 */}
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
						<Link href="/" className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200">
							{t('nav_home')}
						</Link>
						<a 
							href="https://limgx.com" 
							target="_blank" 
							rel="noopener noreferrer"
							className="text-sm text-muted-foreground hover:text-primary transition-colors duration-200 flex items-center space-x-1"
						>
							<span>{t('footer_main_site')}</span>
							<ExternalLink className="w-3 h-3" />
						</a>
					</div>
				</div>
			</div>
		</footer>
	);
}

export default Footer;

import { useTranslation } from 'react-i18next';
import { motion } from 'framer-motion';

export function LanguageSwitcher() {
  const { i18n } = useTranslation();
  const isZhHK = i18n.language === 'zh-HK';

  const toggle = () => {
    const next = isZhHK ? 'en' : 'zh-HK';
    i18n.changeLanguage(next);
    localStorage.setItem('uptownmartz_lang', next);
  };

  return (
    <motion.button
      whileTap={{ scale: 0.92 }}
      onClick={toggle}
      title={isZhHK ? 'Switch to English' : '切換至中文'}
      className="flex items-center gap-1.5 bg-card border border-border rounded-xl px-2.5 py-1.5 text-xs font-bold text-foreground hover:bg-muted/60 transition-colors select-none"
    >
      <span className="text-sm leading-none">{isZhHK ? '🇬🇧' : '🇭🇰'}</span>
      <span className="tracking-wide">{isZhHK ? 'EN' : '中文'}</span>
    </motion.button>
  );
}

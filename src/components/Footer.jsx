import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Facebook, Twitter, Instagram, Linkedin } from 'lucide-react';
import logoEventBlack from '../assets/img/LogoBlack.png';
import logoEvent from '../assets/img/logoEvent.png';
import { useTheme } from '@/components/theme-provider';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { theme } = useTheme();

  return (
    <motion.footer
      className='bg-gray-400/50 text-gray-900 dark:bg-gray-700'
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }} // once: false pour l'animation répétitive
      transition={{ duration: 0.8 }}
    >
      <div className='container mx-auto px-6 py-12'>
        <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
          {/* About Section */}
          <div className='col-span-1'>
            <img
              className='w-53 h-53'
              src={theme === 'dark' ? logoEventBlack : logoEvent}
              alt='Logo EventHub'
            />
          </div>

          <div className='col-span-1 md:col-span-1 dark:text-white'>
            <h2 className='text-2xl font-bold mb-4'>EventHub</h2>
            <p>
              Votre plateforme centrale pour découvrir et organiser des événements locaux.
            </p>
          </div>

          {/* Links Section */}
          <div className='col-span-1'>
            <h3 className='text-lg font-semibold mb-4 dark:text-white'>
              Navigation
            </h3>
            <ul className='space-y-2'>
              <li><Link to='/' className='dark:text-white hover:text-white transition-colors'>Accueil</Link></li>
              <li><Link to='/events' className='dark:text-white hover:text-white transition-colors'>Événements</Link></li>
              <li><Link to='/locations' className='dark:text-white hover:text-white transition-colors'>Lieux</Link></li>
              <li><Link to='/about' className='dark:text-white hover:text-white transition-colors'>À Propos</Link></li>
              <li><Link to='/contact' className='dark:text-white hover:text-white transition-colors'>Contact</Link></li>
            </ul>
          </div>

          {/* Legal Section */}
          <div className='col-span-1'>
            <h3 className='text-lg font-semibold dark:text-white mb-4'>Légal</h3>
            <ul className='space-y-2'>
              <li><a href='#' className='dark:text-white hover:text-white transition-colors'>Conditions d'utilisation</a></li>
              <li><a href='#' className='dark:text-white hover:text-white transition-colors'>Politique de confidentialité</a></li>
            </ul>
          </div>
        </div>

        <div className='mt-12 border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center'>
          <p className='dark:text-gray-200 text-sm mb-4 md:mb-0'>
            &copy; {currentYear} EventHub. Tous droits réservés.
          </p>
          <div className='flex space-x-4'>
            <a href='#' className='dark:text-white hover:text-white transition-colors'><Facebook /></a>
            <a href='#' className='dark:text-white hover:text-white transition-colors'><Twitter /></a>
            <a href='#' className='dark:text-white hover:text-white transition-colors'><Instagram /></a>
            <a href='#' className='dark:text-white hover:text-white transition-colors'><Linkedin /></a>
          </div>
        </div>
      </div>
    </motion.footer>
  );
};

export default Footer;
// Import all images for proper Vite bundling
import profileImg from './img/profile.jpg';
import backgroundImg from './img/background.jpg';
import interBioProject from './img/interbio_project.png';

// Import favicon icons
import briefcaseIcon from './img/favicon/briefcase.png';
import codeIcon from './img/favicon/code.png';
import dartIcon from './img/favicon/dart.png';
import discordIcon from './img/favicon/discord.png';
import djangoIcon from './img/favicon/django.png';
import dockerIcon from './img/favicon/docker.png';
import envelopeIcon from './img/favicon/envelope.png';
import figmaIcon from './img/favicon/figma.png';
import flutterIcon from './img/favicon/flutter.png';
import folderIcon from './img/favicon/folder.png';
import geminiIcon from './img/favicon/gemini.png';
import githubIcon from './img/favicon/github.png';
import gptIcon from './img/favicon/gpt.png';
import ijIcon from './img/favicon/ij.png';
import interbioIcon from './img/favicon/interbio.png';
import javaIcon from './img/favicon/java.png';
import javascriptIcon from './img/favicon/javascript.png';
import kementransIcon from './img/favicon/kementrans.png';
import linkedinIcon from './img/favicon/linkedin.png';
import pythonIcon from './img/favicon/python.png';
import reactIcon from './img/favicon/react.png';
import seleniumIcon from './img/favicon/selenium.png';
import springbootIcon from './img/favicon/springboot.png';
import tailwindIcon from './img/favicon/tailwind.png';
import ubuntuIcon from './img/favicon/ubuntu.png';
import userIcon from './img/favicon/user.png';
import vscIcon from './img/favicon/vsc.png';
import wordpressIcon from './img/favicon/wordpress.png';

// Create mapping objects for easy access
export const images = {
  profile: profileImg,
  background: backgroundImg,
  interbio_project: interBioProject
};

export const icons = {
  briefcase: briefcaseIcon,
  code: codeIcon,
  dart: dartIcon,
  discord: discordIcon,
  django: djangoIcon,
  docker: dockerIcon,
  envelope: envelopeIcon,
  figma: figmaIcon,
  flutter: flutterIcon,
  folder: folderIcon,
  gemini: geminiIcon,
  github: githubIcon,
  gpt: gptIcon,
  ij: ijIcon,
  interbio: interbioIcon,
  java: javaIcon,
  javascript: javascriptIcon,
  kementrans: kementransIcon,
  linkedin: linkedinIcon,
  python: pythonIcon,
  react: reactIcon,
  selenium: seleniumIcon,
  springboot: springbootIcon,
  tailwind: tailwindIcon,
  ubuntu: ubuntuIcon,
  user: userIcon,
  vsc: vscIcon,
  wordpress: wordpressIcon
};

// Helper functions for components
export const getImage = (imageName) => images[imageName];
export const getIcon = (iconName) => icons[iconName];
import type { CategoryId } from '../types';

export type LandingCategoryGroupId =
  | 'communication-work'
  | 'web-discovery'
  | 'privacy-security'
  | 'social-entertainment'
  | 'money-commerce'
  | 'devices-platforms'
  | 'ai-creative'
  | 'builders-infrastructure'
  | 'uncategorized';

export interface LandingCategoryGroup {
  id: LandingCategoryGroupId;
  categories: CategoryId[];
}

export const landingCategoryGroups: LandingCategoryGroup[] = [
  {
    id: 'communication-work',
    categories: [
      'email',
      'mail-client',
      'messaging',
      'meeting-software',
      'office-suite',
      'note-taking',
      'scheduling',
      'project-management',
    ],
  },
  {
    id: 'web-discovery',
    categories: [
      'search-engine',
      'browser',
      'maps',
      'cloud-storage',
      'translation',
      'writing-assistant',
    ],
  },
  {
    id: 'privacy-security',
    categories: [
      'password-manager',
      '2fa-authenticator',
      'vpn',
      'dns',
      'privacy-tools',
      'iam',
    ],
  },
  {
    id: 'social-entertainment',
    categories: [
      'social-media',
      'video-hosting',
      'music-streaming',
      'podcasts',
      'feed-reader',
      'media-server',
      'photo-management',
    ],
  },
  {
    id: 'money-commerce',
    categories: [
      'payments',
      'ecommerce',
      'personal-finance',
    ],
  },
  {
    id: 'devices-platforms',
    categories: [
      'smartphones',
      'mobile-os',
      'desktop-os',
      'app-stores',
      'smart-home',
    ],
  },
  {
    id: 'ai-creative',
    categories: [
      'ai-ml',
      'image-generation',
      'design',
      'video-editing',
    ],
  },
  {
    id: 'builders-infrastructure',
    categories: [
      'hosting',
      'databases',
      'version-control',
      'analytics',
      'virtualization',
      'gis',
    ],
  },
];

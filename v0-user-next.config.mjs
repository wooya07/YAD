import withPWA from 'next-pwa';

// GitHub Pages 배포를 위한 설정
const isGitHubPages = process.env.GITHUB_PAGES === 'true';
const repositoryName = process.env.REPOSITORY_NAME || '';

const pwa = withPWA({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development',
  // GitHub Pages에 배포할 때 서비스 워커 경로 수정
  sw: {
    dest: 'public',
    runtimeCaching: [
      {
        urlPattern: /^https?.*/,
        handler: 'NetworkFirst',
        options: {
          cacheName: 'offlineCache',
          expiration: {
            maxEntries: 200,
          },
        },
      },
    ],
  },
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // GitHub Pages 배포 시 basePath 설정
  ...(isGitHubPages ? { basePath: `/${repositoryName}` } : {}),
  // GitHub Pages 배포 시 assetPrefix 설정
  ...(isGitHubPages ? { assetPrefix: `/${repositoryName}/` } : {}),
  // 이미지 도메인 설정 (필요한 경우)
  images: {
    unoptimized: true,
  },
  // 정적 HTML 내보내기 설정
  output: 'export',
};

export default pwa(nextConfig);


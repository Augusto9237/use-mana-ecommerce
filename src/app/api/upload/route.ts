import { route, type Router } from '@better-upload/server';
import { toRouteHandler } from '@better-upload/server/adapters/next';
import { cloudflareClient } from '@/lib/cloudflare';

const router: Router = {
  client: cloudflareClient,
  bucketName: process.env.R2_BUCKET_NAME || 'rd-store', 
  routes: {
    images: route({
      fileTypes: ['image/*'],
      multipleFiles: true,
      maxFiles: 4,
      onAfterSignedUrl: async () => {
        return {
          metadata: {
            publicUrl: process.env.R2_PUBLIC_URL || '',
          },
        };
      },
    }),
  },
};

export const { POST } = toRouteHandler(router);
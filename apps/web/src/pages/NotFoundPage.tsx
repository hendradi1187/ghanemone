/**
 * NotFoundPage — 404 fallback untuk route yang tidak match.
 */
import { useNavigate } from 'react-router-dom';
import { EmptyState, Page, Stack } from '@ghanem/ui';

export function NotFoundPage(): JSX.Element {
  const navigate = useNavigate();
  return (
    <Page scroll>
      <div className="flex-1 min-h-screen flex items-center justify-center p-6 bg-surface-bg">
        <div className="w-full max-w-lg">
          <Stack direction="col" gap="4">
            <EmptyState
              variant="no-results"
              icon="search"
              title="Halaman tidak ditemukan"
              description="URL yang Anda buka tidak tersedia atau telah dipindahkan."
              action={{ label: 'Kembali ke beranda', onClick: () => navigate('/'), icon: 'arrowR' }}
              secondaryAction={{
                label: 'Jelajah dataset',
                onClick: () => navigate('/explore'),
                icon: 'database',
              }}
            />
          </Stack>
        </div>
      </div>
    </Page>
  );
}

export default NotFoundPage;

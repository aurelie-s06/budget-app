import '@adonisjs/inertia/types'

import type React from 'react'
import type { Prettify } from '@adonisjs/core/types/common'

type ExtractProps<T> =
  T extends React.FC<infer Props>
    ? Prettify<Omit<Props, 'children'>>
    : T extends React.Component<infer Props>
      ? Prettify<Omit<Props, 'children'>>
      : never

declare module '@adonisjs/inertia/types' {
  export interface InertiaPages {
    'accounts/index': ExtractProps<(typeof import('../../inertia/pages/accounts/index.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'categories/index': ExtractProps<(typeof import('../../inertia/pages/categories/index.tsx'))['default']>
    'dashboard': ExtractProps<(typeof import('../../inertia/pages/dashboard.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
    'months/show': ExtractProps<(typeof import('../../inertia/pages/months/show.tsx'))['default']>
    'recurring/index': ExtractProps<(typeof import('../../inertia/pages/recurring/index.tsx'))['default']>
    'transactions/index': ExtractProps<(typeof import('../../inertia/pages/transactions/index.tsx'))['default']>
    'years/show': ExtractProps<(typeof import('../../inertia/pages/years/show.tsx'))['default']>
    'settings/show': ExtractProps<(typeof import('../../inertia/pages/settings/show.tsx'))['default']>
    'imports/index': ExtractProps<(typeof import('../../inertia/pages/imports/index.tsx'))['default']>
    'triage/index': ExtractProps<(typeof import('../../inertia/pages/triage/index.tsx'))['default']>
  }
}

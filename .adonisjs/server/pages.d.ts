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
    '._dashboard': ExtractProps<(typeof import('../../inertia/pages/._dashboard.tsx'))['default']>
    '._home': ExtractProps<(typeof import('../../inertia/pages/._home.tsx'))['default']>
    'auth/._login': ExtractProps<(typeof import('../../inertia/pages/auth/._login.tsx'))['default']>
    'auth/._signup': ExtractProps<(typeof import('../../inertia/pages/auth/._signup.tsx'))['default']>
    'auth/login': ExtractProps<(typeof import('../../inertia/pages/auth/login.tsx'))['default']>
    'auth/signup': ExtractProps<(typeof import('../../inertia/pages/auth/signup.tsx'))['default']>
    'dashboard': ExtractProps<(typeof import('../../inertia/pages/dashboard.tsx'))['default']>
    'errors/._not_found': ExtractProps<(typeof import('../../inertia/pages/errors/._not_found.tsx'))['default']>
    'errors/._server_error': ExtractProps<(typeof import('../../inertia/pages/errors/._server_error.tsx'))['default']>
    'errors/not_found': ExtractProps<(typeof import('../../inertia/pages/errors/not_found.tsx'))['default']>
    'errors/server_error': ExtractProps<(typeof import('../../inertia/pages/errors/server_error.tsx'))['default']>
    'home': ExtractProps<(typeof import('../../inertia/pages/home.tsx'))['default']>
  }
}

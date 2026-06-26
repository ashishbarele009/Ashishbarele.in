/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { Navigate, Outlet } from 'react-router-dom';
import { User } from 'firebase/auth';

interface ProtectedLayoutProps {
  user: User | null;
}

const ADMIN_EMAIL = 'ashishbarele09@gmail.com';

export default function ProtectedLayout({ user }: ProtectedLayoutProps) {
  if (!user || user.email !== ADMIN_EMAIL) {
    return <Navigate to="/admin-login" replace />;
  }

  return <Outlet />;
}

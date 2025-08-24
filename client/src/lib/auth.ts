export interface AdminSession {
  token: string;
  username: string;
  loginTime: string;
}

export function getAdminSession(): AdminSession | null {
  try {
    const sessionData = localStorage.getItem('admin_session');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData) as AdminSession;
    
    // Check if session is expired (24 hours)
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const hoursDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60);
    
    if (hoursDiff > 24) {
      localStorage.removeItem('admin_session');
      return null;
    }
    
    return session;
  } catch {
    localStorage.removeItem('admin_session');
    return null;
  }
}

export function isAdminAuthenticated(): boolean {
  return getAdminSession() !== null;
}

export function clearAdminSession(): void {
  localStorage.removeItem('admin_session');
}

export function requireAdminAuth(): AdminSession {
  const session = getAdminSession();
  if (!session) {
    throw new Error('Admin authentication required');
  }
  return session;
}
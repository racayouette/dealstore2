export interface AdminSession {
  token: string;
  username: string;
  loginTime: string;
}

export interface UserSession {
  id: string;
  username: string;
  email: string;
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

// User session management for regular users
export function getUserSession(): UserSession | null {
  try {
    const sessionData = localStorage.getItem('user_session');
    if (!sessionData) return null;
    
    const session = JSON.parse(sessionData) as UserSession;
    
    // Check if session is expired (7 days for regular users)
    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const daysDiff = (now.getTime() - loginTime.getTime()) / (1000 * 60 * 60 * 24);
    
    if (daysDiff > 7) {
      localStorage.removeItem('user_session');
      return null;
    }
    
    return session;
  } catch {
    localStorage.removeItem('user_session');
    return null;
  }
}

export function isUserAuthenticated(): boolean {
  return getUserSession() !== null;
}

export function setUserSession(user: { id: string; username: string; email: string }): void {
  const session: UserSession = {
    ...user,
    loginTime: new Date().toISOString()
  };
  localStorage.setItem('user_session', JSON.stringify(session));
}

export function clearUserSession(): void {
  localStorage.removeItem('user_session');
}
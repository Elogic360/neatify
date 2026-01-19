/**
 * @deprecated Use AdminLayoutEnhanced component instead
 */
import { Navigate } from 'react-router-dom';

export default function AdminLayout() {
  return <Navigate to="/admin" replace />;
}

import { Navigate } from 'react-router-dom';
import { getAccessToken } from '../utils/auth';

export default function HomeRoute({ children }) {
  return getAccessToken() ? <Navigate to="/today" replace /> : children;
}

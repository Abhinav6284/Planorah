import { Navigate, generatePath, useLocation, useParams } from 'react-router-dom';

export default function RedirectWithParams({ to }) {
  const params = useParams();
  const { search, hash } = useLocation();
  return <Navigate to={`${generatePath(to, params)}${search}${hash}`} replace />;
}

import { useRouteError } from 'react-router-dom';
import ErrorPage from '../pages/ErrorPage';

export default function ErrorBoundary() {
  const error = useRouteError();
  if (process.env.NODE_ENV === 'development' && error) {
    console.error('Route error:', error);
  }
  return <ErrorPage />;
}

import { Link } from 'react-router-dom';

export default function NotFoundPage() {
  return (
    <div className="catch_error_page catch_error_404">
      <div className="catch_error_inner">
        <p className="catch_error_code">404</p>
        <h1 className="catch_error_title">Page not found</h1>
        <p className="catch_error_text">
          The page you’re looking for doesn’t exist or has been moved.
        </p>
        <Link to="/" className="catch_error_btn">Back to Catch Menu</Link>
      </div>
    </div>
  );
}

import { Link } from 'react-router-dom';

export default function ErrorPage() {
  return (
    <div className="catch_error_page catch_error_generic">
      <div className="catch_error_inner">
        <p className="catch_error_code">Oops</p>
        <h1 className="catch_error_title">Something went wrong</h1>
        <p className="catch_error_text">
          We couldn’t load this page. Please try again or go back to the home page.
        </p>
        <Link to="/" className="catch_error_btn">Back to Catch Menu</Link>
      </div>
    </div>
  );
}

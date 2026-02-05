<?php
// Run with: php -S localhost:8001 router.php
// Then: / = index.php, /test1 = menu.php?slug=test1, static files served as usual.
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$path = trim($uri, '/');
if ($path === '' || $path === 'index.php') {
	include __DIR__ . '/index.php';
	return true;
}
$file = __DIR__ . '/' . $path;
if (file_exists($file) && is_file($file)) {
	return false; // let built-in server serve the file
}
$_GET['slug'] = $path;
include __DIR__ . '/menu.php';
return true;

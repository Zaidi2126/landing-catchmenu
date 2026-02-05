<?php
/**
 * Serves menu template HTML by code.
 * GET ?code=m_001 returns content of menu_templates/m_001.html
 * Code must be alphanumeric, underscore, or hyphen only.
 */
$code = isset($_GET['code']) ? trim($_GET['code']) : '';
if ($code === '' || !preg_match('/^[a-zA-Z0-9_-]+$/', $code)) {
	header('HTTP/1.1 400 Bad Request');
	exit;
}

// Look for menu_templates in same directory as this script
$base = realpath(__DIR__);
$path = $base . DIRECTORY_SEPARATOR . 'menu_templates' . DIRECTORY_SEPARATOR . $code . '.html';
$path = realpath($path);

if ($path === false || $base === false || strpos($path, $base) !== 0 || !is_file($path)) {
	header('HTTP/1.1 404 Not Found');
	exit;
}

header('Content-Type: text/html; charset=utf-8');
readfile($path);

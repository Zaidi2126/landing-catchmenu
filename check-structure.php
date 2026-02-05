<?php
/**
 * Upload this file to the SAME folder as index.php on InfinityFree.
 * Open: https://catchmenu.infinityfree.me/check-structure.php
 * It shows whether css/, js/, img/ exist and lists their files.
 * DELETE this file after fixing (security).
 */
header('Content-Type: text/plain; charset=utf-8');
$dir = __DIR__;
echo "Document root (this script's folder): " . $dir . "\n\n";

$folders = ['css', 'js', 'img', 'modal', 'menu_templates'];
foreach ($folders as $f) {
	$path = $dir . DIRECTORY_SEPARATOR . $f;
	$exists = is_dir($path);
	echo "[ " . ($exists ? 'OK' : 'MISSING' ) . " ] /$f/\n";
	if ($exists) {
		$files = @scandir($path);
		if ($files) {
			$files = array_diff($files, ['.', '..']);
			foreach (array_slice($files, 0, 15) as $file) {
				echo "    - $file\n";
			}
			if (count($files) > 15) echo "    ... and " . (count($files) - 15) . " more\n";
		}
	}
	echo "\n";
}

echo "Key files in root:\n";
foreach (['index.php', 'menu.php', 'router.php', '.htaccess'] as $f) {
	echo "[ " . (is_file($dir . DIRECTORY_SEPARATOR . $f) ? 'OK' : 'MISSING') . " ] $f\n";
}
echo "\nDone. Delete this file (check-structure.php) after use.\n";

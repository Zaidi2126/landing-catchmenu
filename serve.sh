#!/bin/sh
# Start PHP built-in server from the project root so router.php is found.
# Usage: ./serve.sh   or   sh serve.sh
cd "$(dirname "$0")"
exec php -S localhost:8001 router.php

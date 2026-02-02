<?php
/**
 * Simple PHP Signaling Server - ONLY FOR LOCAL/INTRANET USE
 * For production: use proper auth, rate limiting, and a real database
 */

// Basic config
$maxChannels = 50;
$maxDataSize = 500000; // 500KB per channel
$allowedOrigin = null; // Set to your domain for CORS, e.g. 'https://yourdomain.com'

$dataDir = __DIR__ . '/sync_data';
if (!is_dir($dataDir)) mkdir($dataDir, 0700, true);

// CORS
if ($allowedOrigin) {
    header("Access-Control-Allow-Origin: $allowedOrigin");
} 
header('Access-Control-Allow-Methods: GET, POST');

// Strict channel name validation - must be long enough to be secure
$channel = $_GET['channel'] ?? '';
if (!preg_match('/^[a-zA-Z0-9_-]{8,64}$/', $channel)) {
    http_response_code(400);
    die(json_encode(['error' => 'Channel must be 8-64 alphanumeric characters']));
}

$channelFile = "$dataDir/$channel.json";
$action = $_GET['action'] ?? '';

// Limit total channels
if ($action === 'push' && !file_exists($channelFile)) {
    $existing = glob("$dataDir/*.json");
    if (count($existing) >= $maxChannels) {
        http_response_code(429);
        die(json_encode(['error' => 'Too many channels']));
    }
}

if ($action === 'push') {
    $input = file_get_contents('php://input');
    if (strlen($input) > $maxDataSize) {
        http_response_code(413);
        die(json_encode(['error' => 'Data too large']));
    }
    if ($input && json_decode($input) !== null) {
        file_put_contents($channelFile, $input, LOCK_EX);
        file_put_contents("$channelFile.time", time(), LOCK_EX);
    }
    header('Content-Type: application/json');
    echo json_encode(['ok' => true]);
    exit;
}

if ($action === 'pull') {
    header('Content-Type: application/json');
    echo file_exists($channelFile) ? file_get_contents($channelFile) : '{}';
    exit;
}

if ($action === 'stream') {
    header('Content-Type: text/event-stream');
    header('Cache-Control: no-cache');
    header('X-Accel-Buffering: no');
    
    $lastMod = 0;
    $maxTime = 300; // 5 min max connection
    $start = time();
    
    while (time() - $start < $maxTime) {
        $timeFile = "$channelFile.time";
        $currentMod = file_exists($timeFile) ? (int)file_get_contents($timeFile) : 0;
        
        if ($currentMod > $lastMod && file_exists($channelFile)) {
            echo "data: " . json_encode(['type' => 'update', 'data' => json_decode(file_get_contents($channelFile))]) . "\n\n";
            $lastMod = $currentMod;
        }
        
        if (ob_get_level()) ob_flush();
        flush();
        if (connection_aborted()) break;
        sleep(1);
    }
    exit;
}

header('Content-Type: application/json');
echo json_encode(['error' => 'Unknown action']);

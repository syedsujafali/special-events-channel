<?php
declare(strict_types=1);

session_start();
header('Content-Type: application/json; charset=utf-8');

$recipient = 'info@specialeventschannel.com';
$maxMessageLength = 900;
$maxNameLength = 80;
$maxEmailLength = 120;
$maxInterestLength = 80;
$minSecondsOnPage = 3;
$maxSubmissionsPerHour = 5;

function respond(bool $ok, string $message, int $status = 200): void
{
    http_response_code($status);
    echo json_encode(['ok' => $ok, 'message' => $message]);
    exit;
}

function field(string $key): string
{
    return trim((string)($_POST[$key] ?? ''));
}

function has_header_injection(string $value): bool
{
    return preg_match('/[\r\n]/', $value) === 1;
}

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    respond(false, 'Invalid request method.', 405);
}

if (field('formVersion') !== 'sec-v1') {
    respond(false, 'Invalid form version.', 422);
}

if (field('companyWebsite') !== '') {
    respond(false, 'Spam validation failed.', 422);
}

$startedAt = (int)field('startedAt');
$now = time();
if ($startedAt <= 0 || ($now - $startedAt) < $minSecondsOnPage || ($now - $startedAt) > 86400) {
    respond(false, 'Timing validation failed. Please refresh and try again.', 422);
}

$rateWindow = $_SESSION['sec_contact_window'] ?? ['start' => $now, 'count' => 0];
if (!is_array($rateWindow) || !isset($rateWindow['start'], $rateWindow['count'])) {
    $rateWindow = ['start' => $now, 'count' => 0];
}
if (($now - (int)$rateWindow['start']) > 3600) {
    $rateWindow = ['start' => $now, 'count' => 0];
}
if ((int)$rateWindow['count'] >= $maxSubmissionsPerHour) {
    respond(false, 'Message limit reached. Please try again later.', 429);
}

$name = field('name');
$email = field('email');
$interest = field('interest');
$message = field('message');

if ($name === '' || $email === '' || $interest === '' || $message === '') {
    respond(false, 'Please complete all fields.', 422);
}

if (strlen($name) > $maxNameLength || strlen($email) > $maxEmailLength || strlen($interest) > $maxInterestLength || strlen($message) > $maxMessageLength) {
    respond(false, 'One or more fields exceed the maximum length.', 422);
}

if (strlen($message) < 20) {
    respond(false, 'Please include at least 20 characters in your message.', 422);
}

if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
    respond(false, 'Please enter a valid email address.', 422);
}

if (has_header_injection($name) || has_header_injection($email) || has_header_injection($interest)) {
    respond(false, 'Invalid characters detected.', 422);
}

$safeName = htmlspecialchars($name, ENT_QUOTES, 'UTF-8');
$safeInterest = htmlspecialchars($interest, ENT_QUOTES, 'UTF-8');
$subject = 'Special Events Channel inquiry: ' . $safeInterest;
$body = "Special Events Channel inquiry\n\n";
$body .= "Name: " . $safeName . "\n";
$body .= "Email: " . $email . "\n";
$body .= "Project type: " . $safeInterest . "\n\n";
$body .= "Message:\n" . $message . "\n";

$headers = [];
$headers[] = 'From: Special Events Channel <info@specialeventschannel.com>';
$headers[] = 'Reply-To: ' . $email;
$headers[] = 'Content-Type: text/plain; charset=UTF-8';
$headers[] = 'X-Mailer: PHP/' . phpversion();

$sent = mail($recipient, $subject, $body, implode("\r\n", $headers));

if (!$sent) {
    respond(false, 'The message service is unavailable on this server.', 500);
}

$rateWindow['count'] = (int)$rateWindow['count'] + 1;
$_SESSION['sec_contact_window'] = $rateWindow;

respond(true, 'Message sent.');
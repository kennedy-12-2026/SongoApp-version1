<?php
header('Content-Type: application/json');
error_reporting(0);

$data = json_decode(file_get_contents('php://input'), true);
$action = $data['action'] ?? '';

if ($action === 'init') {
    echo json_encode(['plateau' => array_fill(0, 14, 5), 'scoreSud' => 0, 'scoreNord' => 0, 'tour' => 'SUD']);
    exit;
}

if ($action === 'jouer') {
    $plateau = $data['plateau'];
    $index = (int)$data['index'];
    $tour = $data['tour'];
    $scoreSud = (int)$data['scoreSud'];
    $scoreNord = (int)$data['scoreNord'];

    $graines = $plateau[$index];
    $plateau[$index] = 0;
    $pos = $index;

    // SEMIS : Sauter la case de départ au tour complet
    for ($i = 0; $i < $graines; $i++) {
        $pos = ($pos + 1) % 14;
        if ($pos === $index) { $i--; continue; }
        $plateau[$pos]++;
    }

    // CAPTURE : 2, 3 ou 4 dans le camp adverse
    $pointsGagnes = 0;
    while (true) {
        $estAdverse = ($tour === 'SUD' && $pos >= 7) || ($tour === 'NORD' && $pos < 7);
        if ($estAdverse && ($plateau[$pos] >= 2 && $plateau[$pos] <= 4)) {
            $pointsGagnes += $plateau[$pos];
            $plateau[$pos] = 0;
            $pos = ($pos - 1 + 14) % 14; // Reculer
        } else { break; }
    }

    if ($tour === 'SUD') $scoreSud += $pointsGagnes; else $scoreNord += $pointsGagnes;

    echo json_encode([
        'plateau' => $plateau,
        'scoreSud' => $scoreSud,
        'scoreNord' => $scoreNord,
        'tour' => ($tour === 'SUD' ? 'NORD' : 'SUD'),
        'capturePoints' => $pointsGagnes
    ]);
    exit;
}

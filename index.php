<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Songo Royal-Ekang</title>
    <link rel="stylesheet" href="style.css">
</head>
<body>

    <!-- ÉCRAN D'ACCUEIL -->
    <div id="ecran-accueil">
        <h1 class="titre-royal">SONGO ROYAL-EKANG</h1>
        <button class="btn-start" onclick="demarrerJeu()">
            🎮 COMMENCER LE JEU
        </button>
    </div>

    <!-- ÉCRAN DE JEU -->
    <div id="jeu-container" style="display: none;">
        <h1 class="titre-mini">SONGO ROYAL-EKANG</h1>

        <div class="score-container">
            <div class="score-lumineux">
                <span id="score-nord">0</span>
                <span class="label-score">Camp Nord ❄️</span>
            </div>
            <div id="phrase-tour">Au tour du Camp Nord</div>
            <div class="score-lumineux">
                <span id="score-sud">0</span>
                <span class="label-score">Camp Sud 🔥</span>
            </div>
        </div>

        <div class="plateau-3d">
            <!-- RANGÉE NORD -->
            <div class="ligne-complete">
                <div class="nom-camp-label">CAMP NORD ❄️</div>
                <div class="rangee" id="rangee-nord"></div>
            </div>

            <!-- RANGÉE SUD -->
            <div class="ligne-complete">
                <div class="nom-camp-label">CAMP SUD 🔥</div>
                <div class="rangee" id="rangee-sud"></div>
            </div>
        </div>

        <div class="footer">
            <button class="btn-reset" onclick="resetJeu()">🔄 RÉINITIALISER LE JEU</button>
        </div>
    </div>

    <audio id="son-graine" src="assets/bruit_graines.wav"></audio>
    <audio id="son-capture" src="assets/capture.wav"></audio>

    <script src="script.js"></script>
</body>
</html>

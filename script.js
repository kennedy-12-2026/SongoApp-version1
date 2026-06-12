// --- CONFIGURATION SONGO EKANG ---
let plateau = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
let scoreNord = 0, scoreSud = 0;
let tourActuel = "Nord";
let enAction = false;

// Ordre de rotation horaire (Nord: 6 vers 0 | Sud: 7 vers 13)
const ordreSongo = [6, 5, 4, 3, 2, 1, 0, 7, 8, 9, 10, 11, 12, 13];

function demarrerJeu() {
    document.getElementById('ecran-accueil').style.display = 'none';
    document.getElementById('jeu-container').style.display = 'flex';
    initialiserPlateau();
}

function initialiserPlateau() {
    const rN = document.getElementById('rangee-nord'), rS = document.getElementById('rangee-sud');
    rN.innerHTML = ''; rS.innerHTML = '';
    // Affichage visuel : le Nord de 0 à 6, le Sud de 7 à 13
    for(let i=0; i<7; i++) rN.appendChild(creerTrou(i));
    for(let i=7; i<14; i++) rS.appendChild(creerTrou(i));
    actualiserAffichage();
}

function creerTrou(i) {
    let t = document.createElement('div');
    t.className = 'trou'; t.id = `trou-${i}`;
    t.onclick = () => jouerCoup(i);
    t.innerHTML = `<div class="compteur" id="nb-${i}"></div><div id="gv-${i}" style="display:flex;flex-wrap:wrap;justify-content:center;width:100%;"></div>`;
    return t;
}

function actualiserAffichage() {
    for (let i = 0; i < 14; i++) {
        document.getElementById(`nb-${i}`).innerText = plateau[i];
        const zone = document.getElementById(`gv-${i}`);
        zone.innerHTML = '';
        let nbV = Math.min(plateau[i], 12);
        for (let g = 0; g < nbV; g++) {
            let d = document.createElement('div'); d.className = 'graine'; zone.appendChild(d);
        }
    }
    document.getElementById('score-nord').innerText = scoreNord;
    document.getElementById('score-sud').innerText = scoreSud;
    const info = document.getElementById('phrase-tour');
    info.innerText = `Au tour du Camp ${tourActuel}`;
    info.style.color = (tourActuel === "Nord") ? "#3498db" : "#e67e22";
    info.style.borderColor = (tourActuel === "Nord") ? "#3498db" : "#e67e22";
}

async function jouerCoup(index) {
    if (enAction) return;
    if (tourActuel === "Nord" && (index < 0 || index > 6)) return;
    if (tourActuel === "Sud" && (index < 7 || index > 13)) return;
    if (plateau[index] === 0) return;

    if (!verifierSolidarite(index)) {
        alert("Solidarité ! Vous devez envoyer des graines à votre adversaire.");
        return;
    }

    enAction = true;
    let main = plateau[index];
    plateau[index] = 0;
    let actuel = index;
    let nbTours = 0;

    for (let i = 0; i < main; i++) {
        let idxOrdre = ordreSongo.indexOf(actuel);
        actuel = ordreSongo[(idxOrdre + 1) % 14];

        if (actuel === index) { i--; nbTours++; continue; }

        // RÈGLE CASE 7 : Score plafonné à 40
        let case7 = (tourActuel === "Nord" ? 0 : 13);
        if (index === case7 && main <= 2) {
            let estChezAdverse = (tourActuel === "Nord" ? actuel >= 7 : actuel <= 6);
            if (estChezAdverse) {
                if (tourActuel === "Nord") scoreSud = Math.min(40, scoreSud + 1); 
                else scoreNord = Math.min(40, scoreNord + 1);
                continue;
            }
        }

        plateau[actuel]++;
        try { document.getElementById('son-graine').cloneNode().play(); } catch(e){}
        actualiserAffichage();
        await new Promise(r => setTimeout(r, 200));
    }

    recolter(actuel, nbTours);
    tourActuel = (tourActuel === "Nord") ? "Sud" : "Nord";
    actualiserAffichage();
    verifierFin();
    enAction = false;
}

function verifierSolidarite(indexChoisi) {
    let adverse = tourActuel === "Nord" ? [7,8,9,10,11,12,13] : [0,1,2,3,4,5,6];
    if (!adverse.every(i => plateau[i] === 0)) return true;

    let mesTrous = tourActuel === "Nord" ? [0,1,2,3,4,5,6] : [7,8,9,10,11,12,13];
    let maxEnvoi = -1;
    let peutEnvoyer7 = [];

    mesTrous.forEach(t => {
        if (plateau[t] === 0) return;
        let simulation = 0, curseur = t, n = plateau[t];
        for(let i=0; i<n; i++) {
            let idx = ordreSongo.indexOf(curseur);
            curseur = ordreSongo[(idx+1)%14];
            if(curseur === t) { i--; continue; }
            if(adverse.includes(curseur)) simulation++;
        }
        if (simulation >= 7) peutEnvoyer7.push(t);
        if (simulation > maxEnvoi) maxEnvoi = simulation;
    });

    if (peutEnvoyer7.length > 0) return peutEnvoyer7.includes(indexChoisi);
    let envoiActuel = 0, curseur = indexChoisi, n = plateau[indexChoisi];
    for(let i=0; i<n; i++) {
        let idx = ordreSongo.indexOf(curseur);
        curseur = ordreSongo[(idx+1)%14];
        if(curseur === indexChoisi) { i--; continue; }
        if(adverse.includes(curseur)) envoiActuel++;
    }
    return envoiActuel === maxEnvoi;
}

function recolter(dernierIndex, nbTours) {
    let adverse = tourActuel === "Nord" ? [7,8,9,10,11,12,13] : [0,1,2,3,4,5,6];
    let case1Adv = tourActuel === "Nord" ? 7 : 6;

    // Récolte Case 1 plafonnée à 40
    if (dernierIndex === case1Adv && nbTours >= 1) {
        plateau[dernierIndex]--;
        if (tourActuel === "Nord") scoreNord = Math.min(40, scoreNord + 1); 
        else scoreSud = Math.min(40, scoreSud + 1);
        jouerSonCapture(); return;
    }

    if (!adverse.includes(dernierIndex) || dernierIndex === case1Adv) return;

    let tempPlateau = [...plateau];
    let totalGagne = 0, curseur = dernierIndex;

    while (adverse.includes(curseur)) {
        let totalTrou = tempPlateau[curseur];
        if (totalTrou >= 2 && totalTrou <= 4) {
            totalGagne += totalTrou;
            tempPlateau[curseur] = 0;
            let idx = ordreSongo.indexOf(curseur);
            curseur = ordreSongo[(idx - 1 + 14) % 14];
        } else break;
    }

    let estVide = adverse.every(i => tempPlateau[i] === 0);
    if (totalGagne > 0 && !estVide) {
        plateau = tempPlateau;
        // AJOUT DES POINTS AVEC LIMITE DE 40
        if (tourActuel === "Nord") scoreNord = Math.min(40, scoreNord + totalGagne); 
        else scoreSud = Math.min(40, scoreSud + totalGagne);
        jouerSonCapture();
    }
}

function jouerSonCapture() { try { document.getElementById('son-capture').play(); } catch(e){} }

function verifierFin() {
    let grainestotales = plateau.reduce((a, b) => a + b, 0);
    let fini = false, msg = "";

    // VICTOIRE À 40 PILE
    if (scoreNord === 40) { fini = true; msg = "VICTOIRE CAMP NORD ! 🏆"; }
    else if (scoreSud === 40) { fini = true; msg = "VICTOIRE CAMP SUD ! 🏆"; }
    else if (grainestotales < 10) {
        for(let i=0; i<7; i++) scoreNord = Math.min(40, scoreNord + plateau[i]);
        for(let i=7; i<14; i++) scoreSud = Math.min(40, scoreSud + plateau[i]);
        fini = true;
        if (scoreNord < 40 && scoreSud < 40) msg = "MATCH NUL !";
        else msg = scoreNord === 40 ? "VICTOIRE NORD !" : "VICTOIRE SUD !";
    }

    if (fini) {
        enAction = true;
        setTimeout(() => { 
            // On affiche le modal de victoire royal
            const modal = document.getElementById('modal-victoire');
            if(modal) {
                document.getElementById('titre-vainqueur').innerText = msg;
                document.getElementById('details-score').innerText = `Score Final: Nord ${scoreNord} - Sud ${scoreSud}`;
                modal.style.display = 'flex';
            } else {
                alert(msg); location.reload(); 
            }
        }, 500);
    }
}

// AJOUT DES NOUVELLES FONCTIONS DE CONTRÔLE
function resetJeu() {
    plateau = [5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5, 5];
    scoreNord = 0; scoreSud = 0;
    tourActuel = "Nord"; enAction = false;
    const modal = document.getElementById('modal-victoire');
    if(modal) modal.style.display = 'none';
    actualiserAffichage();
}

function quitterJeu() {
    if(confirm("Voulez-vous quitter la partie ?")) {
        location.reload(); 
    }
}

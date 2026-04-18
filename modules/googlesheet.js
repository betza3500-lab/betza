export {
  load,
  getDeelnemers,
  getPronos,
  getWedstrijden,
  getResults,
  getTotals,
  getGrafiekData,
  getAllDeelnemers,
  getEditions,
  getCached,
  rowsToObjects,
  whoIsWinner,
  calculateScore,
  calculateScoreFinale,
  calculateScoreSchiftingsvraag,
  parseCommaSeparated
};

import { GoogleSpreadsheet } from 'google-spreadsheet';
import NodeCache from 'node-cache';

// Constants
const SHEET_NAMES = {
  PRONO: 'prono',
  DEELNEMERS: 'deelnemers',
  WEDSTRIJDEN: 'wedstrijden'
};

const CACHE_KEYS = {
  DOC: 'doc',
  DEELNEMERS: 'deelnemers',
  ALL_DEELNEMERS: 'alldeelnemers',
  EDITIONS: 'editions',
  WEDSTRIJDEN: 'wedstrijden',
  PRONOS: 'pronos'
};

const SCHIFTINGSVRAAG = 'Schiftingsvraag';
const SCORE_REGEX = /^\d+-\d+$/;
const ROUND_REGEXES = {
  VOORRONDES: /^M\d+/,
  ACHTSTE: /^AF\d+/,
  KWART: /^KF\d+/,
  HALVE: /(^HF\d+|^F2)/,
  FINALE: /^F1/
};

const myCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120
});

/**
 * Wrapper for cached async operations
 */
async function getCached(cacheKey, fetchFn) {
  if (myCache.has(cacheKey)) {
    return myCache.get(cacheKey);
  }
  const data = await fetchFn();
  myCache.set(cacheKey, data);
  return data;
}

/**
 * Convert sheet rows to array of objects with proper property names
 */
function rowsToObjects(rows, headers, trimValues = false) {
  return rows.map(row => {
    const item = {};
    headers.forEach(h => {
      const val = row[h];
      item[h] = trimValues && val !== undefined ? val.trim() : val;
    });
    return item;
  });
}

async function load() {
  return getCached(CACHE_KEYS.DOC, async () => {
    console.log('Fetching data from ' + process.env.GOOGLE_SPREADSHEET);
    const doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    });
    await doc.loadInfo();
    return doc;
  });
}

async function getDeelnemers() {
  return getCached(CACHE_KEYS.DEELNEMERS, async () => {
    console.log('Fetching deelnemers');
    const doc = await load();
    const sheet = doc.sheetsByTitle[SHEET_NAMES.PRONO];
    await sheet.getRows();
    const deelnemerNames = sheet.headerValues.slice(1);
    const allDeelnemers = await getAllDeelnemers();
    return deelnemerNames.map(name => allDeelnemers.find(d => d.naam === name));
  });
}

async function getAllDeelnemers() {
  return getCached(CACHE_KEYS.ALL_DEELNEMERS, async () => {
    console.log('Fetching all deelnemers sheet');
    const doc = await load();
    const sheet = doc.sheetsByTitle[SHEET_NAMES.DEELNEMERS];
    const rows = await sheet.getRows();
    return rowsToObjects(rows, sheet.headerValues);
  });
}

async function getEditions() {
  return getCached(CACHE_KEYS.EDITIONS, async () => {
    console.log('Fetching editions');
    const doc = await load();
    const sheet = doc.sheetsByTitle[SHEET_NAMES.DEELNEMERS];
    await sheet.getRows();
    return sheet.headerValues.slice(3);
  });
}

async function getWedstrijden() {
  return getCached(CACHE_KEYS.WEDSTRIJDEN, async () => {
    console.log('Fetching wedstrijden sheet');
    const doc = await load();
    const sheet = doc.sheetsByTitle[SHEET_NAMES.WEDSTRIJDEN];
    const rows = await sheet.getRows();
    return rowsToObjects(rows, sheet.headerValues, true);
  });
}

async function getPronos() {
  return getCached(CACHE_KEYS.PRONOS, async () => {
    console.log('Fetching pronos sheet');
    const doc = await load();
    const sheet = doc.sheetsByTitle[SHEET_NAMES.PRONO];
    const rows = await sheet.getRows();
    return rowsToObjects(rows, sheet.headerValues, true);
  });
}



/**
 * Determine winner from score string (e.g. "3-1")
 */
function whoIsWinner(score) {
  const [home, away] = score.split('-').map(Number);
  if (home > away) return 'home';
  if (home < away) return 'away';
  return 'draw';
}

function calculateScore(matchResult, matchProno, isBelgium, isJoker) {
  let result = 0;
  if (matchResult != undefined) {
    if (whoIsWinner(matchProno) == whoIsWinner(matchResult)) {
      result = isBelgium ? 2 : 1;
      if (isJoker) {
        result += 1;
      }
    }
    if (matchProno == matchResult) {
      result = isBelgium ? 4 : 3;
      if (isJoker) {
        result += 1;
      }
    }    
  }
  return result;
}

function calculateScoreFinale(id, finalisten, pronoFinalisten) {
  let result = 0;
  if (finalisten != undefined && finalisten.length > 0 &&  pronoFinalisten != undefined && pronoFinalisten.length > 0) {
    let intersection = pronoFinalisten.filter(e => finalisten.includes(e));
    //console.log("Intersection: ", id, finalisten, intersection.length);
    const count = intersection.length;
    switch (id) {
      case "AF":
        if( count <= 8 ) {
          result = count;
        } else if (count > 8 && count <= 13) {
          result = 8 + (count - 8) * 2;
        } else if (count >13) {
          result = 8 + (5 * 2) + (count - 13) * 3
        }
        break;
      case "KF":
        if( count <= 4 ) {
          result = count * 2;
        } else if (count > 4 && count <= 6) {
          result = 8 + (count - 4) * 3;
        } else if (count > 6) {
          result = 8 + (2 * 3) + (count - 6) * 4
        }
        break;
      case "HF":
        if( count <= 2 ) {
          result = count * 4;
        } else if (count == 3) {
          result = 8 + 5;
        } else if (count == 4) {
          result = 8 + 5 + 6;
        }    
        break;
      case "F1": 
        if( count == 1 ) {
          result = 5;
        } else if (count == 2) {
          result = 5 + 6;
        } 
        break;
      case "Winnaar":
        if( count == 1 ) {
          result = 6;
        } 
        break;
      case "België":
          if( count == 1 ) {
            if (intersection[0] === "voorrondes" ) {
              result = 2;
            } else if (intersection[0] === "AF" ) {
              result = 3;
            } else if (intersection[0] === "KF" ) {
              result = 5;
            } else if (intersection[0] === "HF" ) {
              result = 7;
            } else if (intersection[0] === "F1" ) {
              result = 9;
            } else if (intersection[0] === "Winnaar" ) {
              result = 10;
            }
          } 
          break;
        }
  }
  
  return result;
}

async function calculateScoreSchiftingsvraag(prono, result) {
  return 0;
}

/**
 * Parse comma-separated values from a string
 */
function parseCommaSeparated(str) {
  return str ? str.split(',').map(s => s.trim()) : [];
}

async function getPronoResultsForGame(id, score, isBelgium) {
  const pronos = await getPronos();
  const jokers = pronos.find(e => e.id === 'Jokers') || {};
  const bribes = pronos.find(e => e.id === 'Bribes') || {};
  const pronoGame = pronos.find(e => e.id === id);
  
  if (!pronoGame) return [];

  return Object.keys(pronoGame).slice(1).map(deelnemer => {
    const jokerIds = parseCommaSeparated(jokers[deelnemer]);
    const briefIds = parseCommaSeparated(bribes[deelnemer]);
    const isJoker = jokerIds.includes(id);
    const isBribe = briefIds.includes(id);

    return {
      deelnemer,
      prono: pronoGame[deelnemer],
      joker: isJoker,
      bribe: isBribe,
      belgium: isBelgium,
      resultaat: isBribe
        ? calculateScore(score, pronoGame[deelnemer], false, false)
        : calculateScore(score, pronoGame[deelnemer], isBelgium, isJoker)
    };
  });
}

async function getPronoResultsForFinales(id, finalisten) {
  const pronos = await getPronos();
  const pronoFinale = pronos.find(e => e.id === id);
  
  if (!pronoFinale) return [];

  return Object.keys(pronoFinale).slice(1).map(deelnemer => ({
    deelnemer,
    prono: parseCommaSeparated(pronoFinale[deelnemer]),
    resultaat: calculateScoreFinale(id, finalisten, parseCommaSeparated(pronoFinale[deelnemer]))
  }));
}

async function getPronoResultsForSchiftingsvraag(result) {
  const pronos = await getPronos();
  const prono = pronos.find(e => e.id === SCHIFTINGSVRAAG);
  
  if (!prono) return [];

  return Object.keys(prono).slice(1).map(deelnemer => ({
    deelnemer,
    prono: prono[deelnemer]?.trim() || '',
    resultaat: 0
  }));
}

async function getFinaleResults(finale) {
  const winnaar = await getWinnaar();
  let result;

  if (finale === 'Winnaar') {
    result = winnaar;
  } else if (finale === 'België') {
    result = winnaar.includes('België') 
      ? ['Winnaar'] 
      : (winnaar.length > 0 ? await getResultBelgium() : []);
  } else {
    result = await getFinalisten(finale);
  }

  return {
    id: finale,
    result,
    pronoResults: await getPronoResultsForFinales(finale, result)
  };
}

async function getSchiftingsvraagResults() {
  const result = await getSchiftingsvraagUitslag();
  return {
    id: SCHIFTINGSVRAAG,
    result,
    pronoResults: await getPronoResultsForSchiftingsvraag(result)
  };
}

async function getResults() {
  const wedstrijden = await getWedstrijden();
  const voorrondes = wedstrijden.filter(e => e.id.startsWith('M'));

  const results = [];
  
  for (const match of voorrondes) {
    const isBelgium = match.thuis === 'België' || match.uit === 'België';
    results.push({
      id: match.id,
      poule: match.poule,
      date: match.datum,
      time: match.tijd,
      stadium: match.stadion,
      home: match.thuis,
      away: match.uit,
      result: match.uitslag,
      pronoResults: await getPronoResultsForGame(match.id, match.uitslag, isBelgium)
    });
  }

  // Add finale results
  for (const finale of ['AF', 'KF', 'HF', 'F1', 'Winnaar', 'België']) {
    results.push(await getFinaleResults(finale));
  }
  results.push(await getSchiftingsvraagResults());

  return results;
}

async function getTotals() {
  const results = await getResults();
  const deelnemers = await getDeelnemers();

  // Calculate totals for each participant
  const totals = deelnemers.map(deelnemer => {
    const total = results.reduce((sum, result) => {
      const score = result.pronoResults?.find(s => s.deelnemer === deelnemer.naam);
      return sum + (score?.resultaat || 0);
    }, 0);

    return {
      deelnemer: deelnemer.naam,
      pictureID: deelnemer.PictureID,
      total
    };
  });

  // Sort and add ranking
  const sorted = totals.sort((a, b) => b.total - a.total);
  let rank = 1;

  return sorted.map((item, index) => {
    if (index > 0 && item.total < sorted[index - 1].total) {
      rank = index + 1;
    }
    return { ...item, rank };
  });
}

async function getGrafiekData() {
  const results = await getResults();
  const deelnemers = await getDeelnemers();
  const labels = results.map(r => r.id);

  const datasets = deelnemers.map(deelnemer => {
    let total = 0;
    const scores = [];

    for (const result of results) {
      if (SCORE_REGEX.test(result.result) || (result.result && result.result.length > 0)) {
        const score = result.pronoResults?.find(s => s.deelnemer === deelnemer.naam);
        total += score?.resultaat || 0;
        scores.push(total);
      } else {
        break;
      }
    }

    return {
      label: deelnemer.naam,
      data: scores,
      backgroundColor: deelnemer.kleur,
      borderColor: deelnemer.kleur,
      total,
      fill: false,
      cubicInterpolationMode: 'monotone',
      tension: 0.4
    };
  });

  return { labels, datasets };
}

async function getFinalisten(id) {
  const wedstrijden = await getWedstrijden();
  const finalisten = [];

  wedstrijden
    .filter(e => e.id.startsWith(id) && e.thuis && e.uit)
    .forEach(e => {
      finalisten.push(e.thuis, e.uit);
    });

  return finalisten;
}

async function getSchiftingsvraagUitslag() {
  const wedstrijden = await getWedstrijden();
  return wedstrijden
    .filter(e => e.id.startsWith(SCHIFTINGSVRAAG))
    .map(e => e.uitslag);
}

async function getWinnaar() {
  const wedstrijden = await getWedstrijden();
  const game = wedstrijden.find(e => e.id.startsWith('F1'));

  if (!game || !SCORE_REGEX.test(game.uitslag)) {
    return [];
  }

  const [home, away] = game.uitslag.split('-').map(Number);
  if (home > away) return [game.thuis];
  if (away > home) return [game.uit];
  return ['Fout: gelijke stand, iemand moet winnaar zijn'];
}

async function getResultBelgium() {
  const wedstrijden = await getWedstrijden();
  const matchesBelgium = wedstrijden.filter(e => e.thuis === 'België' || e.uit === 'België');

  if (matchesBelgium.length === 0) return [];

  const lastMatchId = matchesBelgium[matchesBelgium.length - 1].id;

  // Check which round Belgium reached
  if (ROUND_REGEXES.VOORRONDES.test(lastMatchId)) return ['voorrondes'];
  if (ROUND_REGEXES.ACHTSTE.test(lastMatchId)) return ['AF'];
  if (ROUND_REGEXES.KWART.test(lastMatchId)) return ['KF'];
  if (ROUND_REGEXES.HALVE.test(lastMatchId)) return ['HF'];
  if (ROUND_REGEXES.FINALE.test(lastMatchId)) return ['F1'];

  return [];
}

export { load, getDeelnemers, getPronos, getWedstrijden, getResults, getTotals, getGrafiekData, getAllDeelnemers, getEditions};

import { GoogleSpreadsheet } from 'google-spreadsheet';
import NodeCache from 'node-cache';

const SCHIFTINGSVRAAG = "Schiftingsvraag";
const myCache = new NodeCache({
  stdTTL: 60,
  checkperiod: 120
});

const scoreRegex = new RegExp('[0-9]+-[0-9]+');

async function load() {
  let doc = myCache.get("doc");
  if (doc == undefined) {
    console.log('Fetching data from ' + process.env.GOOGLE_SPREADSHEET);
    doc = new GoogleSpreadsheet(process.env.GOOGLE_SPREADSHEET);
    await doc.useServiceAccountAuth({
      client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n")
    });
    await doc.loadInfo()
    myCache.set('doc', doc ); 
  } else {
    //console.log('Using doc cache');
  }
  return doc;
}

async function getDeelnemers() {
  if (myCache.has("deelnemers")) {
    return myCache.get("deelnemers");
  } else {
    console.log('Fetching deelnemers '); 
    const doc = await load();
    const sheet = doc.sheetsByTitle["prono"];
    await sheet.getRows();
    const deelnemers = sheet.headerValues.slice(1);
    
    let data =[];
    const allDeelnemers = await getAllDeelnemers();
    for(const deelnemer of deelnemers) {
      const item = allDeelnemers.find(d => d.naam == deelnemer);
      data.push(item);
    }
    myCache.set('deelnemers', data );
    return data;
  } 
}

async function getAllDeelnemers() {
  if (myCache.has("alldeelnemers")) {
    return myCache.get("alldeelnemers");
  } else {
    console.log('Fetching deelnemers sheet'); 
    const doc = await load();
    const sheet = doc.sheetsByTitle["deelnemers"];
    const rows = await sheet.getRows();
    const headers = sheet.headerValues;
    const data = [];
    rows.forEach(e => {
      var item={};
      headers.forEach(h => {
        item[h] = e[h];
      })
      data.push(item);
    });
    myCache.set('alldeelnemers', data ); 
    return data;
  } 
}

async function getEditions() {
  if (myCache.has("editions")) {
    return myCache.get("editions");
  } else {
    console.log('Fetching deelnemers sheet'); 
    const doc = await load();
    const sheet = doc.sheetsByTitle["deelnemers"];
    const rows = await sheet.getRows();
    const editions = sheet.headerValues.slice(3);
    myCache.set('editions', editions ); 
    return editions;
  } 
}

async function getWedstrijden() {
  if (myCache.has("wedstrijden")) {
    //console.log('Using wedstrijden sheet cache');
    return myCache.get("wedstrijden");
  } else {
    console.log('Fetching wedstrijden sheet');
    const doc = await load();
    const sheet = doc.sheetsByTitle["wedstrijden"];
    const rows = await sheet.getRows();
    const headers = sheet.headerValues;
    const data = [];
    rows.forEach(e => {
      var item={};
      headers.forEach(h => {
        let val = e[h] != undefined ? e[h].trim() : e[h];
        item[h] = val;
      })
      data.push(item);
    });
    myCache.set("wedstrijden", data ); 
    return data;
  } 
}


async function getPronos() {

  if (myCache.has("pronos")) {
    //console.log('Using pronos sheet cache');
    return myCache.get("pronos");
  } else {
    console.log('Fetching pronos sheet');
    const doc = await load();
    const sheet = doc.sheetsByTitle["prono"];
    const rows = await sheet.getRows();
    const headers = sheet.headerValues;
    const data = [];
    rows.forEach(e => {
      var item={};
      
      headers.forEach(h => {
        let val = e[h] != undefined ? e[h].trim() : e[h];
        item[h] = val;
      })
      data.push(item);
    });
    if (myCache.set("pronos", data )) { 
      return data;
    }; 
  } 
}



function whoIsWinner(score){
  let result;
  let points = score.split("-");
  if (parseInt(points[0]) > parseInt(points[1])) {
    result="home";
  } else if (parseInt(points[0])==parseInt(points[1])) {
    result="draw";
  } else if (parseInt(points[0]) < parseInt(points[1])) {
    result="out";
  }
  return result;
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

async function getPronoResultsForGame(id, score, isBelgium) {
  const pronos = await getPronos();
  const jokers = pronos.find(e => e.id == "Jokers");
  const bribes = pronos.find(e => e.id == "Bribes");
  const pronoGame = pronos.find(e => e.id == id);
  if(pronoGame) {
    let data = [];
    (Object.keys(pronoGame).slice(1)).forEach(k => {
      let item={};
      item.deelnemer = k;
      item.prono = pronoGame[k];
      let isJoker = false;
      if (jokers[k] && jokers[k].includes(',')) {
        isJoker = jokers[k].split(',').map(e => e.trim()).includes(id);
      }
      item.joker = isJoker;
      let isBribe = false;
      if (bribes[k] && bribes[k] != "") {
          isBribe = bribes[k].split(',').map(e => e.trim()).includes(id);
      }
      item.bribe = isBribe;
      item.belgium = isBelgium;
      //Let op, indien je een score aanpast van een wedstrijd waar je bonuspunten voor kan binnenhalen (= wedstrijd met joker of wedstrijd van de Belgen), dan vervallen na aanpassing de bonuspunten. Je kan voor deze match dan enkel nog de reguliere punten binnen halen.
      if(isBribe) {
        item.resultaat = calculateScore(score, pronoGame[k], false, false);  
      } else {
        item.resultaat = calculateScore(score, pronoGame[k], isBelgium, isJoker);
      }
      data.push(item);
    });
    return data;
  }
}

async function getPronoResultsForFinales(id, finalisten) {
  const pronos = await getPronos();
  const pronoFinale = pronos.find(e => e.id == id);
  if(pronoFinale) {
    let data = [];
    (Object.keys(pronoFinale).slice(1)).forEach(k => {
      let item={};
      item.deelnemer = k;
      if(pronoFinale[k]) {
        if (pronoFinale[k].includes(",")) {
	        item.prono = pronoFinale[k].split(",").map(e => e.trim());
        } else {
	        item.prono = [ pronoFinale[k].trim() ];
	      }
      } else {
        item.prono = [];
      }
      item.resultaat = calculateScoreFinale(id, finalisten, item.prono);
      data.push(item);
    });
    return data;
  }
}


async function getPronoResultsForSchiftingsvraag(result) {
  const pronos = await getPronos();
  const prono = pronos.find(e => e.id == SCHIFTINGSVRAAG);
  if(prono) {
    let data = [];
    (Object.keys(prono).slice(1)).forEach(k => {
      let item={};
      item.deelnemer = k;
      if(prono[k]) {
        item.prono = prono[k].trim();
      }
      item.resultaat = 0;
      data.push(item);
    });
    return data;
  }
}

async function getFinaleResults(finale) {
  
  var game= {};
  game.id= finale;
  let winnaar = await getWinnaar();
  let finalisten;
  if (finale == "Winnaar") {
    game.result =  winnaar;
  } else if (finale == "België") {
    if(winnaar.find(e => e === "België")) {
      game.result = ['Winnaar'];
    } else if (winnaar.length > 0) {
      game.result = await getResultBelgium();
    } else  {
      game.result = [];
    }
  } else {
    game.result= await getFinalisten(finale);
  }
  game.pronoResults= await getPronoResultsForFinales(finale, game.result);
  return game;
}

async function getSchiftingsvraagResults() {
  
  var game= {};
  game.id= SCHIFTINGSVRAAG;
  game.result= await getSchiftingsvraagUitslag();
  game.pronoResults= await getPronoResultsForSchiftingsvraag(game.result);
  return game;
}

async function getResults() {
  const wedstrijden = await getWedstrijden();
  var results= [];
  let voorrondes = await wedstrijden.filter(e=> e.id.startsWith("M"));
  for (const e of voorrondes) {
    var game= {};
    game.id= e.id
    game.poule= e.poule
    game.date=e.datum
    game.time=e.tijd
    game.stadium=e.stadion
    game.home=e.thuis;
    game.out=e.uit;
    game.result=e.uitslag;
    let isBelgium = (e.thuis == "België" || e.uit == "België") ? true : false;
    let pronoResult = await getPronoResultsForGame(e.id, e.uitslag, isBelgium);
    game.pronoResults= pronoResult;
    results.push(game);
  }
  
  results.push(await getFinaleResults('AF'));
  results.push(await getFinaleResults('KF'));
  results.push(await getFinaleResults('HF'));
  results.push(await getFinaleResults('F1'));
  results.push(await getFinaleResults('Winnaar'));
  results.push(await getFinaleResults('België'));
  results.push(await getSchiftingsvraagResults());
  return results;
}

async function getTotals() {
  const results = await getResults();
  const deelnemers = await getDeelnemers();
  let data=[];
  for (const deelnemer of deelnemers) {
    let total = 0;
    let item = {};
    item.deelnemer = deelnemer.naam;
    item.pictureID = deelnemer.PictureID;
    for (const result of results) {
      const score = result.pronoResults.find(e => e.deelnemer == deelnemer.naam);
      if (score != undefined) {
        total = total + score.resultaat;
      }
    }
    item.total = total;
    data.push(item);
  }
 
  let sortedData = data.sort((a,b) => b.total - a.total);
  // Add ranking numbers with ties
  let rankedEntries = [];
  let currentRank = 1;
  sortedData.forEach((item, index) => {
      if (index > 0 && item.total < sortedData[index - 1].total) {
          currentRank += 1;
      }
      rankedEntries.push({ deelnemer: item.deelnemer, pictureID: item.pictureID, total: item.total, rank: currentRank });
  });
  return rankedEntries;
}

async function getGrafiekData() {
  const results = await getResults();
  const deelnemers = await getDeelnemers();

  var datasets = [];
  var labels = [];

  for (const result of results) {
    labels.push(result.id);
  }
/*
{
  "label": "10",
  "data": [
   0,
   0,
   0,
   0,
   0,
   0
  ],
  "backgroundColor": "#1f943f",
  "borderColor": "#1f943f",
  "total": 0,
  "fill": false,
  "cubicInterpolationMode": "monotone",
  "tension": 0.4
 },
 */


  for (const deelnemer of deelnemers) {
    var item= {};
    item.label=deelnemer.naam;
    var scores = [];
    var total=0;
    // Er moeten opeenvolgende matchresultaten zijn, anders worden de resultaten niet opgenomen in de grafiek. Bij de finales gelden 
    for (const result of results){
      if(scoreRegex.test(result.result) || (result.result != undefined && result.result.length > 0 ) ) {
        console.log("Result:", result.id)
        const score = result.pronoResults.find(e => e.deelnemer == deelnemer.naam);
        total = total + score.resultaat;
        scores.push(total);
      } else { break;}     
    }
    item.data=(scores);
    item.backgroundColor=deelnemer.kleur;
    item.borderColor=deelnemer.kleur;
    item.total=total;
    item.fill=false
    item.cubicInterpolationMode="monotone";
    item.tension=0.4;
    datasets.push(item);
  }

  var chartData={};
  chartData.labels = labels;
  chartData.datasets = datasets;

  return chartData;
}


async function getFinalisten(id){
  var data=[];
  (await getWedstrijden())
      .filter(e => (e.id.startsWith(id) && e.thuis != undefined && e.uit != undefined))
      .forEach(e => {
        data.push(e.thuis);
        data.push(e.uit);
      });
  return data;
}

async function getSchiftingsvraagUitslag(){
  var data=[];
  (await getWedstrijden())
      .filter(e => (e.id.startsWith(SCHIFTINGSVRAAG)))
      .forEach(e => {
        data.push(e.uitslag);
      });
  return data;
}

async function getWinnaar() {
  let game = (await getWedstrijden()).find(e => e.id.startsWith("F1"));
  var result=[];
  if (scoreRegex.test(game.uitslag)) {
      let uitslag = game.uitslag.split('-'); 
      if (parseInt(uitslag[0]) > parseInt(uitslag[1])) {
        result.push(game.thuis);
      } else if(parseInt(uitslag[0]) < parseInt(uitslag[1])) {
        result.push(game.uit);
      } else {
        result.push('Fout: gelijke stand, iemand moet winnaar zijn');
      }
    } 
    return result;
}


async function getResultBelgium() {
  const wedstrijden = await getWedstrijden();
  let matchesBelgium = wedstrijden.filter(e => (e.thuis === "België" || e.uit === "België"));
  let result=[];
  let lastMatchBelgium = (matchesBelgium[matchesBelgium.length-1]).id;

  const voorrondesRegex = new RegExp('M[0-9]+');
  const achtsteRegex = new RegExp('AF[0-9]+');
  const kwartRegex = new RegExp('KF[0-9]+');
  const halveRegex = new RegExp('(HF[0-9]+|F2)');
  const finaleRegex = new RegExp('F1');

  if(voorrondesRegex.test(lastMatchBelgium)) {
    result.push('voorrondes');
  } else if (achtsteRegex.test(lastMatchBelgium)){
    result.push('AF');
  } else if (kwartRegex.test(lastMatchBelgium)){
    result.push('KF');
  } else if (halveRegex.test(lastMatchBelgium)) {
    result.push('HF');
  } else if (finaleRegex.test(lastMatchBelgium)){
    result.push('F1');
  }
  return result;
}

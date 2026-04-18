<script setup>

import { ref } from 'vue'

import voorzitter from '../assets/voorzitter.jpeg'
import omkoping from '../assets/omkoping.jpeg'
import money from '../assets/money.jpeg'

const logo_toernooi_ref = ref('https://assets.football-logos.cc/logos/tournaments/fifa-world-cup-2026.23c4ca19.svg')
const money_ref = ref(voorzitter)
const omkoping_ref = ref(omkoping)
const money2_ref = ref(money)
</script>

<style scoped>
main {
  padding: .5rem;
}

.btn-prono {
  background-color: var(--betza-light);
}

p {
  text-align: justify;
  line-height: 200%;
}

h2 {
  margin-top: 30px;
}

strong {
  color: var(--betza-light);
  font-weight: bold;
}

q {
  color: var(--betza-dark);
}

.table {
  color: 
}
</style>
<template>
  <main class="container">
    <div class="row">
      <div class="col d-none d-lg-block"></div>
      <div class="col-12 col-lg-9">
        <h1>Betza WK - 2026</h1>
        <div class="d-grid gap-2 col-12 align-content-start">
        <!--  <b-button class="btn-prono btn-block" target="_blank" href="world_cup_2022.xlsx" :size="lg">
            Excel voor pronostiek voorbereiding</b-button> -->
        </div>
        <h2>Woordje van het bestuur</h2>
        <p>Beste Betza aanhangers,</p>
        <p></p>

        <p><img class="d-inline-flex float-start my-1 me-4" :style="{ height: '150px', borderRadius: '10px' }"
            :src="logo_toernooi_ref" />Traditiegetrouw staat het Betza-bestuur weer klaar voor een onvergetelijk toernooi in woelige tijden!<br/><br/><br/></p>
        <!--
            <p><img class="d-inline-flex float-end my-1 ms-4" :style="{ height: '110px', borderRadius: '10px' }"
            :src="money" />Nu het EK met rasse schreden nadert, kunnen jullie dus van start gaan met het uitwerken van
          jullie strategie voor het komende EK.</p>
        <p>Inschrijvingen moeten ten laatste binnen zijn op <strong>woensdag 12 juni</strong>!</p>
        <p></p>
        
        <div class="d-grid gap-2 col-12 align-content-start">
        <b-button class="btn-prono btn-block" target="_blank" href="https://www.wallchart.io/football/world-cup-2026.html" :size="lg">
            Website voor pronostiek voorbereiding</b-button>
        </div>
        -->

        <h2>De Betza-bribe</h2>
        <p><img class="d-inline my-1 my-1 me-4 float-start" :style="{ height: '110px', borderRadius: '10px' }"
            :src="money2_ref" />De <strong>Betza-bribe</strong> was een groot success, het bestuur geniet nog na van hun feestweek in Ibiza op kosten van de bribes.</p>
        <p>De bestuurders aanvaarden 2 bribes per kandidaat. Hiermee krijg je de kans om de uitslag van een wedstrijd in
          de poulefase aan te passen en dat nog tot tijdens de wedstrijd zelf.</p>

        <h3>Hoe werkt het?</h3>
        <p>Heel eenvoudig… Je kan voor 2 voorronde-wedstrijden naar keuze je ingegeven uitslag aanpassen en dit ten
          laatste vóór de start van de tweede helft van de betrokken wedstrijd. Vanaf het moment van aanpassing speel je
          verder met de nieuwe score en worden je punten op deze basis bepaald.</p>
        <p><strong>Let op</strong>, indien je een score aanpast van een wedstrijd waar je bonuspunten voor kan
          binnenhalen (= wedstrijd met joker of wedstrijd van de Belgen), dan vervallen na aanpassing de bonuspunten. Je
          kan voor deze match dan enkel nog de reguliere punten binnen halen.</p>


        <h3>Hoe moet de aangepaste uitslag ingegeven worden?</h3>

        <p><img class="d-inline my-1 ms-4 float-end" :style="{ height: '110px', borderRadius: '10px' }"
            :src="omkoping_ref" />De aangepaste uitslag dient gepost te worden in de officiële Betza-Whatsapp groep door
          middel van een bericht met volgende structuur : '<strong>BRIBE_Match_XX_nieuwe&nbsp;uitslag</strong>'
          (voorbeeld ‘BRIBE_Match_12_1-0’ voor de correctie van de wedstrijd M12 naar een 1-0 score).</p>
        <p>De matchnummers en volgorde van thuis- en uitploeg die je hiervoor gebruikt zijn deze van de officiële Betza
          website</p>
        <p>Deze post dient te gebeuren ten laatste vóór de start van de tweede helft van de betrokken wedstrijd en de
          aanpassing is onherroepelijk.</p>
        <p></p>
        <p>
        <blockquote class="blockquote">
          <q>A bribe won't solve your problems, then again neither will doing nothing.</q>
        </blockquote>
        </p>

        <p>De punten worden zoals gewoonlijk als volgt toegekend:</p>

        <h3>Bonusvraag</h3>

        <p>Waar eindigt België in het EK?<br>Durf wordt beloond! Hoe verder je gokt, hoe meer punten te pakken.</p>
        <ul>
          <li>
            Voorronde : 2 ptn
          </li>
          <li>
            Achtste finale : 3 ptn
          </li>
          <li>
            Kwartfinale : 5 ptn
          </li>
          <li>
            Halve finale : 7 ptn
          </li>
          <li>
            Finale : 9 ptn
          </li>
          <li>
            Winnaar van het EK : 10 ptn
          </li>
        </ul>
        <h3>Voorronde (max 114 ptn)</h3>
        <ul>
          <li>
            1 punt als je de juiste winnaar, de verliezer of het gelijkspel voorspelt
          </li>
          <li>
            3 punten indien je de uitslag van de match correct voorspeld hebt
          </li>
          <li>
            1 extra punt voor een juiste voorspelling van een match van België

          </li>

          <li>
            3 jokers voor een extra punt bij 3 matchen naar keuze

          </li>
        </ul>
        <h3>Eindrondes (max 85 ptn)</h3>

        <ul>
          <li>
            voor de eerste 8 juist voorspelde achtste finalisten : 1 punt
          </li>
          <li>
            voor de 9e - 13e juist voorspelde achtste finalist : 2 punten
          </li>
          <li>
            voor de 14e - 16e juist voorspelde achtste finalist : 3 punten
          </li>

          <br>
          <li>
            voor de eerste 4 juist voorspelde kwartfinalisten : 2 punten
          </li>
          <li>
            voor de 5e en 6e juist voorspelde kwartfinalist : 3 punten
          </li>
          <li>
            voor de 7e en 8e juist voorspelde kwartfinalist : 4 punten
          </li>
          <br>
          <li>
            voor de eerste 2 juist voorspelde halve finalisten : 4 punten
          </li>
          <li>
            voor de 3e juist voorspelde halve finalist : 5 punten
          </li>
          <li>
            voor de 4e juist voorspelde halve finalist : 6 punten
          </li>
          <br>

          <li>
            voor de 1e juist voorspelde finalist : 5 punten
          </li>
          <li>
            voor de 2e juist voorspelde finalist : 6 punten
          </li>
          <br>
          <li>
            6 punten voor de correct voorspelde winnaar van het EK
          </li>
        </ul>
        <div class="d-none d-sm-block">
          <h3>Overzicht puntenverdeling eindrondes:</h3>
          <table class="table small table-dark table-responsive text-muted">
            <thead>
              <tr>
                <td>&nbsp;</td>
                <td>1</td>
                <td>2</td>
                <td>3</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>7</td>
                <td>8</td>
                <td>9</td>
                <td>10</td>
                <td>11</td>
                <td>12</td>
                <td>13</td>
                <td>14</td>
                <td>15</td>
                <td>16</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Achtste</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>3</td>
                <td>3</td>
              </tr>
              <tr>
                <td>Kwart</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>3</td>
                <td>4</td>
                <td>4</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td>Halve</td>
                <td>4</td>
                <td>4</td>
                <td>5</td>
                <td>6</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td>Finalist</td>
                <td>5</td>
                <td>6</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
              <tr>
                <td>Winnaar</td>
                <td>6</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            </tbody>
          </table>
        </div>


        <div>
          Bij een gelijke stand wordt beroep gedaan op de schiftingsvraag.<br>
          <br>
          Veel succes!

        </div>

      </div>
      <div class="col d-none d-lg-block"></div>
    </div>

  </main>
</template>

<script setup>

import { ref } from 'vue'

import logo_toernooi from '../assets/2026_FIFA_World_Cup_emblem.svg.png'
import voorzitter from '../assets/voorzitter.jpeg'
import omkoping from '../assets/omkoping.jpeg'
import money from '../assets/money.jpeg'

const logo_toernooi_ref = ref(logo_toernooi)
const money_ref = ref(voorzitter)
const omkoping_ref = ref(omkoping)
const money2_ref = ref(money)
</script>

<style scoped>
main {
  padding: 1rem 0.75rem 2rem;
}

.btn-prono {
  background-color: var(--betza-light);
}

.page-title {
  margin-bottom: 1.5rem;
}

.content-shell {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.content-section {
  padding: 1.5rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.015));
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.16);
}

.section-title {
  margin-top: 0;
  margin-bottom: 1rem;
}

.intro-block,
.media-text-block {
  overflow: hidden;
}

.section-image {
  border-radius: 14px;
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.22);
}

.section-image-left {
  float: left;
  margin: 0.2rem 1.25rem 0.75rem 0;
}

.section-image-right {
  float: right;
  margin: 0.2rem 0 0.75rem 1.25rem;
}

.subsection {
  margin-top: 1.5rem;
}

.subsection-title {
  margin-top: 0;
  margin-bottom: 0.75rem;
}

.rules-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
}

.rule-card {
  padding: 1rem;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.quote-block {
  margin: 1.25rem 0;
  padding: 1rem 1.25rem;
  border-left: 4px solid var(--betza-light);
  border-radius: 0 12px 12px 0;
  background: rgba(13, 137, 95, 0.08);
}

.points-list {
  margin-bottom: 0;
  padding-left: 1.2rem;
}

.points-list li + li {
  margin-top: 0.45rem;
}

.table-wrap {
  margin-top: 1rem;
  overflow-x: auto;
}

.closing-note {
  padding: 1rem 1.25rem;
  border-radius: 14px;
  background: rgba(155, 208, 43, 0.08);
  border: 1px solid rgba(155, 208, 43, 0.16);
}

p {
  text-align: justify;
  line-height: 1.9;
  margin-bottom: 0.9rem;
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
  color: inherit;
}

.table td,
.table th {
  vertical-align: middle;
}

@media (max-width: 767px) {
  .content-section {
    padding: 1.1rem;
  }

  .section-image-left,
  .section-image-right {
    float: none;
    display: block;
    margin: 0 0 1rem 0;
    max-width: 100%;
  }
}
</style>
<template>
  <main class="container">
    <div class="row">
      <div class="col d-none d-lg-block"></div>
      <div class="col-12 col-lg-9">
        <h1 class="page-title">Betza WK - 2026</h1>
        <div class="content-shell">
          <section class="content-section">
            <div class="d-grid gap-2 col-12 align-content-start">
            <!--  <b-button class="btn-prono btn-block" target="_blank" href="world_cup_2022.xlsx" :size="lg">
                Excel voor pronostiek voorbereiding</b-button> -->
            </div>
            <h2 class="section-title">Woordje van het bestuur</h2>
            <div class="intro-block">
              <p>Beste Betza aanhangers,</p>
              <p>
                <img
                  class="section-image section-image-left"
                  :style="{ height: '150px' }"
                  :src="logo_toernooi_ref"
                />
                Traditiegetrouw staat het Betza-bestuur weer klaar voor een onvergetelijk toernooi in woelige tijden!
              </p>
            </div>
            <!--
                <p><img class="d-inline-flex float-end my-1 ms-4" :style="{ height: '110px', borderRadius: '10px' }"
                :src="money" />Nu het WK met rasse schreden nadert, kunnen jullie dus van start gaan met het uitwerken van
              jullie strategie voor het komende WK.</p>
            <p>Inschrijvingen moeten ten laatste binnen zijn op <strong>woensdag 12 juni</strong>!</p>
            <p></p>

            <div class="d-grid gap-2 col-12 align-content-start">
            <b-button class="btn-prono btn-block" target="_blank" href="https://www.wallchart.io/football/euro-cup-2024.html" :size="lg">
                Website voor pronostiek voorbereiding</b-button>
            </div>
            -->
          </section>

          <section class="content-section">
            <h2 class="section-title">De Betza-bribe</h2>
            <div class="media-text-block">
              <p>
                <img
                  class="section-image section-image-left"
                  :style="{ height: '110px' }"
                  :src="money2_ref"
                />
                De <strong>Betza-bribe</strong> was een groot success, het bestuur geniet nog na van hun feestweek in Ibiza op kosten van de bribes.
              </p>
              <p>De bestuurders aanvaarden 2 bribes per kandidaat. Hiermee krijg je de kans om de uitslag van een wedstrijd in de poulefase aan te passen en dat nog tot tijdens de wedstrijd zelf.</p>
            </div>

            <div class="rules-grid">
              <div class="rule-card">
                <h3 class="subsection-title">Hoe werkt het?</h3>
                <p>Heel eenvoudig… Je kan voor 2 voorronde-wedstrijden naar keuze je ingegeven uitslag aanpassen en dit ten laatste vóór de start van de tweede helft van de betrokken wedstrijd. Vanaf het moment van aanpassing speel je verder met de nieuwe score en worden je punten op deze basis bepaald.</p>
                <p><strong>Let op</strong>, indien je een score aanpast van een wedstrijd waar je bonuspunten voor kan binnenhalen (= wedstrijd met joker of wedstrijd van de Belgen), dan vervallen na aanpassing de bonuspunten. Je kan voor deze match dan enkel nog de reguliere punten binnen halen.</p>
              </div>

              <div class="rule-card">
                <h3 class="subsection-title">Hoe moet de aangepaste uitslag ingegeven worden?</h3>
                <p>
                  <img
                    class="section-image section-image-right"
                    :style="{ height: '110px' }"
                    :src="omkoping_ref"
                  />
                  De aangepaste uitslag dient gepost te worden in de officiële Betza-Whatsapp groep door middel van een bericht met volgende structuur : '<strong>BRIBE_Match_XX_nieuwe&nbsp;uitslag</strong>' (voorbeeld ‘BRIBE_Match_12_1-0’ voor de correctie van de wedstrijd M12 naar een 1-0 score).
                </p>
                <p>De matchnummers en volgorde van thuis- en uitploeg die je hiervoor gebruikt zijn deze van de officiële Betza website</p>
                <p>Deze post dient te gebeuren ten laatste vóór de start van de tweede helft van de betrokken wedstrijd en de aanpassing is onherroepelijk.</p>
              </div>
            </div>

            <div class="quote-block">
              <blockquote class="blockquote mb-0">
                <q>A bribe won't solve your problems, then again neither will doing nothing.</q>
              </blockquote>
            </div>
          </section>

          <section class="content-section">
            <h2 class="section-title">Puntenverdeling</h2>
            <p>De punten worden zoals gewoonlijk als volgt toegekend:</p>

            <div class="subsection">
              <h3 class="subsection-title">Bonusvraag</h3>
              <p>Waar eindigt België in het WK?<br>Durf wordt beloond! Hoe verder je gokt, hoe meer punten te pakken.</p>
              <ul class="points-list">
                <li>Voorronde : 2 ptn</li>
                <li>Zestiende finale : TODO ptn</li>
                <li>Achtste finale : 3 ptn</li>
                <li>Kwartfinale : 5 ptn</li>
                <li>Halve finale : 7 ptn</li>
                <li>Finale : 9 ptn</li>
                <li>Winnaar van het WK : 10 ptn</li>
              </ul>
            </div>

            <div class="rules-grid">
              <div class="rule-card">
                <h3 class="subsection-title">Voorronde (max TODO 114 ptn)</h3>
                <ul class="points-list">
                  <li>1 punt als je de juiste winnaar, de verliezer of het gelijkspel voorspelt</li>
                  <li>3 punten indien je de uitslag van de match correct voorspeld hebt</li>
                  <li>1 extra punt voor een juiste voorspelling van een match van België</li>
                  <li>3 jokers voor een extra punt bij 3 matchen naar keuze</li>
                </ul>
              </div>

              <div class="rule-card">
                <h3 class="subsection-title">Eindrondes (max TODO 85 ptn)</h3>
                <ul class="points-list">
                  <li>voor de eerste 16 juist voorspelde zestiende finalisten : 1 punt</li>
                  <li>voor de 17e - 28e juist voorspelde zestiende finalisten : 2 punten</li>
                  <li>voor de 29e - 32e juist voorspelde zestiende finalisten : 3 punten</li>
                  <li>voor de eerste 8 juist voorspelde achtste finalisten : 1 punt</li>
                  <li>voor de 9e - 13e juist voorspelde achtste finalisten : 2 punten</li>
                  <li>voor de 14e - 16e juist voorspelde achtste finalisten : 3 punten</li>
                  <li>voor de eerste 4 juist voorspelde kwartfinalisten : 2 punten</li>
                  <li>voor de 5e en 6e juist voorspelde kwartfinalisten : 3 punten</li>
                  <li>voor de 7e en 8e juist voorspelde kwartfinalisten : 4 punten</li>
                  <li>voor de eerste 2 juist voorspelde halve finalisten : 4 punten</li>
                  <li>voor de 3e juist voorspelde halve finalist : 5 punten</li>
                  <li>voor de 4e juist voorspelde halve finalist : 6 punten</li>
                  <li>voor de 1e juist voorspelde finalist : 5 punten</li>
                  <li>voor de 2e juist voorspelde finalist : 6 punten</li>
                  <li>6 punten voor de correct voorspelde winnaar van het WK</li>
                </ul>
              </div>
            </div>

            <div class="table-wrap d-none d-sm-block">
              <h3 class="subsection-title">Overzicht puntenverdeling eindrondes:</h3>
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
                <td>17</td>
                <td>18</td>
                <td>19</td>
                <td>20</td>
                <td>21</td>
                <td>22</td>
                <td>23</td>
                <td>24</td>
                <td>25</td>
                <td>26</td>
                <td>27</td>
                <td>28</td>
                <td>29</td>
                <td>30</td>
                <td>31</td>
                <td>32</td>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Zestiende TODO</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
                <td>1</td>
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
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>2</td>
                <td>3</td>
                <td>3</td>
                <td>3</td>
                <td>3</td>
              </tr>
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
                <td>&nbsp;</td>
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
                <td>&nbsp;</td>
              </tr>
            </tbody>
              </table>
            </div>

            <div class="closing-note">
              <p>Bij een gelijke stand wordt beroep gedaan op de schiftingsvraag.</p>
              <p class="mb-0">Veel succes!</p>
            </div>
          </section>
        </div>

      </div>
      <div class="col d-none d-lg-block"></div>
    </div>

  </main>
</template>

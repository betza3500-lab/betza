<script>
  import RowResult from '../components/RowResult.vue'
  import RowFinaleResult from '../components/RowFinaleResult.vue'
  import RowSchiftingsvraagResult from '../components/RowSchiftingsvraagResult.vue'

  export default {
  name: 'App',
  components: { RowResult, RowFinaleResult, RowSchiftingsvraagResult },
  data: () => ({
    loaded: false,
    participants: {},
    games: {},
    totals: [],
    results: []
  }),
  async mounted () {
    let loader = this.$loading.show({
                    // Optional parameters
                    canCancel: true,
                    onCancel: this.onCancel,
                });
    try {     

       await fetch(import.meta.env.VITE_API_BASE_URL + '/api/participants').then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }        
        return response.json();
      })
      .then((data) => {
        this.participants = data;
      })

       fetch(import.meta.env.VITE_API_BASE_URL + '/api/games').then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
        
        return response.json();
      })
      .then((data) => {
        this.games = data;
      })

      fetch(import.meta.env.VITE_API_BASE_URL + '/api/results').then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
        
        return response.json();
      })
      .then((data) => {
        this.results = data;
      })

      fetch(import.meta.env.VITE_API_BASE_URL + '/api/totals').then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
        
        return response.json();
      })
      .then((data) => {
        this.totals = data;
      })

    } catch (e) {
      console.error(e)
    } finally {
      console.log("Loaded");
      setTimeout(() => {
        loader.hide() // hide loading screen
      }, 200);
    }
    
  }
}
</script>
<template>
  <b-table-simple dark small responsive  class="resulttable" >
  <b-thead>
    <b-tr>
      <b-th sticky-column class="header sticky">Groep</b-th>
      <b-th sticky-column class="header sticky">Datum</b-th>
      <b-th sticky-column class="header sticky">ID</b-th>
      <b-th sticky-column class="stickyMatchTitle header" >Match - Uitslag / Deelnemer</b-th>
      
      <template v-for="total in totals">
        <b-th class="sticky header border-end text-center" style="min-width: 90px;" colspan="2" sticky-column>{{total.deelnemer}}&nbsp;({{total.total}})</b-th>
      </template>
    </b-tr>
    <b-tr>
      <b-td  colspan="3" variant="secondary"></b-td>
      <b-td  sticky-column colspan="1" variant="secondary" class="text-end stickyHeader"> Total:</b-td>
      
      <template v-for="total in totals">
        <b-td class="text-nowrap fw-bold text-center" colspan="2" variant="success">{{total.total}}</b-td>
      </template>
      
    </b-tr>
  </b-thead>
  <b-tbody>
    <template v-for="result in results">
        <template v-if="result.id.startsWith('M')">
          <RowResult
          :poule="result.poule"
          :date="result.date + ' ' + result.time"
          :id="result.id"
          :match="result.home + ' - ' + result.out"
          :result="result.result"
          :pronoResults="result.pronoResults"
          :totals="totals"
          />
        </template>
        <template v-else-if="result.id.startsWith('Sch')">
          <RowSchiftingsvraagResult
            :id="result.id"
            :result="result.result"
            :pronoResults="result.pronoResults"  
            :totals="totals"          
          />
        </template>
        <template v-else>
          <RowFinaleResult
            :id="result.id"
            :result="result.result"
            :pronoResults="result.pronoResults"
            :totals="totals"
            />
        </template>
    </template>
    
  </b-tbody>
  <b-tfoot>
    <b-tr>
      <b-td  sticky-column colspan="3" variant="secondary"></b-td>
      <b-td  sticky-column colspan="1" variant="secondary" class="text-end stickyHeader"> Total:</b-td>
      <template v-for="total in totals">
        <b-td class="text-nowrap fw-bold text-center" colspan="2" variant="success">{{total.total}}</b-td>
      </template>
    </b-tr>
  </b-tfoot>
</b-table-simple>
</template>


<style>
  .stickyMatchTitle {
    z-index: 10 !important;
    position: sticky;
    left: 0;
    top: 0;
    border-right: 2px var(--betza-light) solid;
  }

  .header {
    background-color: var(--betza-table-header) !important;
    color: var(--betza-table-header-color) !important;
    border-bottom: 10px var(--betza-light) solid;
  }
  .dark {
    background-color: var(--betza-table-data-1) !important;
    color: white !important;
  }
 .resulttable  {
  font-size: x-small;
  overflow: auto;
  height: 90vh;  
 }

 .resulttable table {
  border-collapse: separate; /* Don't collapse */
  border-spacing: 0;
 }
 .sticky { position: sticky; top: 0; z-index: 1; }
 .stickyHeader { 
  position: sticky; 
  left: 0; 
  z-index: 1; 
  border-right: 2px var(--betza-light) solid;
  }
</style>

<script setup>
import { right } from '@popperjs/core';

  const labels = [
    { id: "ZF", label: "Zestiende finales"},  
    { id: "AF", label: "Achtste finales"},
    { id: "KF", label: "Kwart finales"},
    { id: "HF", label: "Halve finales"},
    { id: "F1", label: "Finales"},
    { id: "Winnaar", label: "Winnaar toernooi"},
    { id: "België", label: "Eindronde België"},
    { id: "Schiftingsvraag", label: "Schiftingsvraag"},
  ]

  const props = defineProps({
    id: {
      type: String,
      required: true
    },
    result: {
      type: Array,
      required: false
    },
    pronoResults: {
      type: Object,
      required: true
    },
    totals: {
      type: Object,
      required: true
    }
  })

  function calculateScoreColor(id, score) {
    const maxs = [
      { id: 'ZF', max: 52},
      { id: 'AF', max: 27},
      { id: 'KF', max: 22},
      { id: 'HF', max: 19},
      { id: 'F1', max: 11},
      { id: 'Winnaar', max: 6},
      { id: 'België', max: 10},
      { id: 'Schiftingsvraag', max: 1},
    ]
    let bgcolor;
    let color;
    if(score <= (maxs.find(e => e.id == id).max)*0.25 ) {
      bgcolor = "#182b25ff";
      color = "#fff";
    } else if (score > (maxs.find(e => e.id == id).max)*0.25 && score <= (maxs.find(e => e.id == id).max)*0.5) {
      bgcolor = "#306843ff";
      color = "#fff";
    } else if (score > (maxs.find(e => e.id == id).max)*0.5 && score <= (maxs.find(e => e.id == id).max)*0.75) {
      bgcolor = "#9bd02bff";
      color = "#fff";
    } else if (score > (maxs.find(e => e.id == id).max)*0.75) {
      bgcolor = "#b7f532ff";
      color = "#000";
    }
        
    let data = {};
    data['background-color']=bgcolor;
    data['color']=color;
    return data;
  }

  </script>
  
  <template>
       <b-tr>
        
        <b-td colspan="3" class="text-end">
        </b-td>
        <b-td sticky-column class="text-nowrap dark stickyHeader">
          {{labels.find(e => e.id == id).label}}:<br/>
            <template v-for="country in result.sort()">
                {{country}}<br/>
            </template>          
        </b-td>
        <template v-for="total in totals">           
            <b-td class="text-nowrap prono" >
              <template v-for="country in pronoResults.find(e => e.deelnemer == total.deelnemer).prono">
                <template v-if="result.includes(country)"><span class="underline">{{country}}</span></template>
                <template v-else>{{country}}</template>
                <br/>
                
              </template>
            </b-td>
            <b-td class="text-nowrap " :style="calculateScoreColor(id, pronoResults.find(e => e.deelnemer == total.deelnemer).resultaat)">{{pronoResults.find(e => e.deelnemer == total.deelnemer).resultaat}}</b-td>
        </template>
      </b-tr>
  </template>

  <style scoped>
      .stickyHeader {
      position: sticky;
      
      left:0px;
      z-index: 1;
      border-right: 2px var(--betza-light) solid;
    }
 
  .prono {
        background-color: var(--betza-table-data);
  }
  .underline {
    text-decoration-color: var(--betza-light) !important;
    text-decoration: underline;
  }
</style>
  

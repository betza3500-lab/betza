<script setup>
const props = defineProps({
  poule: {
    type: String,
    required: true
  },
  date: {
    type: String,
    required: true
  },
  id: {
    type: String,
    required: true
  },
  match: {
    type: String,
    required: true
  },
  result: {
    type: String,
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

function calculateScoreColor(score) {
  let bgcolor;
  let color;
  switch (score) {
    case 0:
      bgcolor = "#182b25ff";
      color = "#fff";
      break;
    case 1:
      bgcolor = "#455b56ff";
      color = "#fff";
      break;
    case 2:
      bgcolor = "#2b4c3bff";
      color = "#fff";
      break;
    case 3:
      bgcolor = "#306843ff";
      color = "#fff";
      break;
    case 4:
      bgcolor = "#9bd02bff";
      color = "#fff";
      break;
    case 5:
      bgcolor = "#b7f532ff";
      color = "#000";
      break;
  }
  let data = {};
  data['background-color'] = bgcolor;
  data['color'] = color;
  return data;
}
function calculateClass(isBelgium) {
  return isBelgium ? "prono text-nowrap text-center belgium" : "prono text-nowrap text-center";
}




</script>
  
<template>
  <b-tr class="m-0">
    <b-td class="text-nowrap">{{poule}}</b-td>
    <b-td class="text-nowrap">{{date}}</b-td>
    <b-td class="text-nowrap">{{id}}</b-td>
    <b-td class="text-nowrap dark stickyHeader">
      <div class="d-flex m-0 p-0">
        <div class="p-0 flex-grow-1">{{match}}</div>
        <div class="p-0 ms-2 ">{{result}}</div>
        <div class="p-0 ms-2 "></div>
      </div>
    </b-td>
    <template v-for="total in totals">
      <b-td :class="calculateClass(pronoResults.find(e => e.deelnemer == total.deelnemer).belgium)">
        <span v-if="pronoResults.find(e => e.deelnemer == total.deelnemer).bribe" class="bribe" v-b-tooltip.hover title="Bribe">
          {{pronoResults.find(e => e.deelnemer == total.deelnemer).prono}}
        </span>
        <span v-else-if="pronoResults.find(e => e.deelnemer == total.deelnemer).joker" class="joker" v-b-tooltip.hover
          title="Joker">
          {{pronoResults.find(e => e.deelnemer == total.deelnemer).prono}}
        </span>
        <span v-else>
          {{pronoResults.find(e => e.deelnemer == total.deelnemer).prono}}
        </span>
      </b-td>
      <b-td :class="calculateClass(pronoResults.find(e => e.deelnemer == total.deelnemer).belgium)"
        :style="calculateScoreColor(pronoResults.find(e => e.deelnemer == total.deelnemer).resultaat)">
        {{pronoResults.find(e => e.deelnemer == total.deelnemer).resultaat}}</b-td>
    </template>
  </b-tr>
</template>

<style scoped>
.stickyHeader {
  position: sticky;

  left: 0px;
  z-index: 1;
  border-right: 2px var(--betza-light) solid;
}

.prono {
  background-color: var(--betza-table-data-1);
  cursor: default;
}

.belgium {
  font-weight: bolder !important;
  color: var(--betza-light);
}

.border-left {
  border-left: 1px #ccc solid;
}

.border-right {
  border-right: 1px #ccc solid;
}

.joker {
  text-decoration: overline;
  text-decoration-color: var(--betza-light);
}

.bribe {
  background-color: var(--betza-light);
  color: var(--betza-table-data-1);
}
</style>
  

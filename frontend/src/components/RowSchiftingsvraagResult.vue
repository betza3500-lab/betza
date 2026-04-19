<script setup>

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
  </script>
  
  <template>
      <b-tr>
        <b-td colspan="3" class="text-end"></b-td>
        <b-td sticky-column class="text-nowrap dark stickyHeader">
          {{id}} {{result[0]}}
        </b-td>         
        <template v-for="total in totals">  
          <b-td class="text-nowrap prono" >
            {{pronoResults.find(e => e.deelnemer == total.deelnemer).prono}}
          </b-td>
          <b-td class="text-nowrap "></b-td>
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

</style>
  

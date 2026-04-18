<script>
  import Line from '../components/LineChart.vue'

  export default {
  name: 'App',
  components: { Line }
}
</script>
<template>
  <div class="tussenstand">
    <Line />
  </div>
</template>

<style >
 .tussenstand {
  flex-grow: 1;
  min-height: 0;
 }
</style>

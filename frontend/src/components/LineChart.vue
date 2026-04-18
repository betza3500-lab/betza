<template >
  <Line
    :chart-data="chartData"
    :chart-options="chartOptions" 
    :styles="myStyles"   
  />
</template>

<script>
import { Line } from 'vue-chartjs'
import { Chart as ChartJS, Title, Tooltip, Legend, LineElement, CategoryScale, LinearScale, PointElement } from 'chart.js'
import { processExpression } from '@vue/compiler-core'

ChartJS.register(
  Title,
  Tooltip,
  Legend,
  LineElement,
  LinearScale,
  PointElement,
  CategoryScale
)


export default {
  name: 'LineChart',
  components: { Line },
  data: () => ({
    loaded: false,
    chartData: {},
    chartOptions: {
      responsive: true, 
      maintainAspectRatio: false,
      plugins: {
        legend: {
        position: 'bottom'
        }
      }
    }
  }),
  computed: {
    myStyles () {
      return {
        height: '90vh',
        position: 'relative'
      }
    }
  },
  async mounted () {
    let loader = this.$loading.show({
        // Optional parameters
        canCancel: true,
        onCancel: this.onCancel,
    });

    try {
      await fetch(import.meta.env.VITE_API_BASE_URL + '/api/scores').then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
        
        return response.json();
      })
      .then((data) => {
        console.log("setting chart data" + data );
        this.chartData = data;
        this.loaded = true
      })
    } catch (e) {
      console.error(e)
    } finally {
      loader.hide() // hide loading screen
      
    }
  }
}
</script>

<style>
</style>
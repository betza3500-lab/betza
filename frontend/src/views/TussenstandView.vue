<script>
import ParticipantAvatar from '../components/ParticipantAvatar.vue'

export default {
  name: 'App',
  components: { ParticipantAvatar },
  data: () => ({
    ranking: {}
  }),
  async mounted() {
    let loader = this.$loading.show({
      // Optional parameters
      canCancel: true,
      onCancel: this.onCancel,
    });

    try {

      await fetch(import.meta.env.VITE_API_BASE_URL + '/api/totals').then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }
        return response.json();
      })
        .then((data) => {
          this.ranking = data;
          console.log(data);
        })

    } catch (e) {
      console.error(e)
    } finally {
      loader.hide() // hide loading screen
    }

  }
}
</script>
  
<template>
  <div id="rankings" class="container">
    <div class="row">
      <div class="col"></div>
      <div class="col-12 col-md-6">
        <div class="container">
          <div v-for="item in ranking" :key="item.deelnemer" class="row rank-item mb-0">
            <div class="col-1 d-flex align-items-center">
              <span class="ranking p-0">{{ item.rank }}.</span>
            </div>
            <div class="col-2 d-flex align-items-center">
              <ParticipantAvatar class="p-0" :pictureId="item.pictureID" />
            </div>
            <div class="col-7 d-flex align-items-center">
              <span class="participant">{{ item.deelnemer }}</span>
            </div>
            <div class="col-2 d-flex align-items-center">
              <b-badge class="total ">{{ item.total }}</b-badge>
            </div>
          </div>
        </div>
      </div>
      <div class="col"></div>
    </div>
    
  </div>
</template>

<style >
.total {
  color: var(--vt-c-black) !important;
  font-size: larger;
  background-color: var(--betza-light) !important;
  white-space: nowrap;
}
#rankings {
  min-width: 350px;
  overflow-x: auto;
}

.rank-item {
  border-bottom: 1px solid var(--betza-light);
  padding-bottom: 0px;
  flex-wrap: nowrap;
  width: 100%;
  white-space: nowrap;
}

.rank-item > [class*='col-'] {
  flex-wrap: nowrap;
}

.ranking {
  font-size: xx-large;
  color: var(--betza-light);
  white-space: nowrap;
}

.participant {
  font-size: xx-large;
  color: var(--vt-c-white);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>

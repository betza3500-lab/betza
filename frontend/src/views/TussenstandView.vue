<script>
import ParticipantAvatar from '../components/ParticipantAvatar.vue'

export default {
  name: 'App',
  components: { ParticipantAvatar },
  data: () => ({
    ranking: []
  }),
  computed: {
    sortedRanking() {
      return [...this.ranking].sort((a, b) => b.total - a.total);
    }
  },
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
    <div class="rank-list">
      <div v-for="item in sortedRanking" :key="item.deelnemer" class="rank-item mb-2">
        <div class="rank-number">
          <span class="ranking">{{ item.rank }}.</span>
        </div>
        <div class="rank-avatar">
          <ParticipantAvatar :pictureId="item.pictureID" />
        </div>
        <div class="rank-name">
          <span class="participant">{{ item.deelnemer }}</span>
        </div>
        <div class="rank-score">
          <b-badge class="total">{{ item.total }}</b-badge>
        </div>
      </div>
    </div>
  </div>
</template>

<style>
.total {
  color: var(--vt-c-black) !important;
  font-size: larger;
  background-color: var(--betza-light) !important;
}

#rankings {
  min-width: 320px;
}

.rank-list {
  width: 100%;
}

.rank-item {
  width: 100%;
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-wrap: wrap;
  border-bottom: 1px solid var(--betza-light);
  padding: 0.75rem 0;
}

.rank-number,
.rank-avatar,
.rank-score {
  flex: 0 0 auto;
}

.rank-name {
  flex: 1 1 100%;
  min-width: 0;
}

.rank-number,
.rank-avatar,
.rank-score {
  flex: 0 0 auto;
}

.rank-name {
  flex: 1 1 auto;
  min-width: 0;
}

.rank-avatar {
  display: flex;
  align-items: center;
  justify-content: center;
}

.ranking {
  font-size: 1.5rem;
  color: var(--betza-light);
  display: inline-block;
  min-width: 2rem;
  text-align: right;
}

.participant {
  font-size: 1.25rem;
  color: var(--vt-c-white);
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.rank-score {
  min-width: 3rem;
  display: flex;
  align-items: center;
  justify-content: flex-end;
}

@media (max-width: 576px) {
  .rank-item {
    gap: 0.5rem;
  }

  .ranking {
    font-size: 1.25rem;
  }

  .participant {
    font-size: 1rem;
  }
}
</style>

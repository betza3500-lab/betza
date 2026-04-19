<script>
import ParticipantPicture from '../components/ParticipantPicture.vue'

export default {
  name: 'App',
  components: { ParticipantPicture },
  data: () => ({
    loaded: false,
    participants: {},
    editions: []
  }),
  async mounted() {
    let loader = this.$loading.show({
      // Optional parameters
      canCancel: true,
      onCancel: this.onCancel,
    });

    try {
      await fetch(import.meta.env.VITE_API_BASE_URL + '/api/alltimeparticipants').then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }

        return response.json();
      })
        .then((data) => {
          this.participants = data;
        })
      await fetch(import.meta.env.VITE_API_BASE_URL + '/api/editions').then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error, status = ${response.status}`);
        }

        return response.json();
      })
        .then((data) => {
          this.editions = data.reverse();
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
  <div class="hall-of-shame" v-for="edition in editions" :key="edition">
    <h2 class="edition-title">{{ edition }}</h2>
    <div class="shame-stage">
      <template v-for="participant in participants" :key="participant.PictureID + edition">
        <div class="shame-card" v-if="participant[edition] == 'L'">
          <ParticipantPicture
              pictureSize="150px"
              border="6px solid #ff80ff"
              ribbon="LOSER"
              :pictureId="participant.PictureID"
            />
          <div class="participant-name">{{ participant.naam }}</div>
        </div>
      </template>
    </div>
  </div>
</template>

<style scoped>
.hall-of-shame {
  margin-bottom: 4rem;
}

.edition-title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: 900;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  color: var(--betza-light);
}

.shame-stage {
  display: flex;
  justify-content: center;
  margin-bottom: 3rem;
}

.shame-badge {
  position: relative;
  z-index: 1;
  padding: 0.45rem 0.85rem;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff9956, #c55d27);
  color: #fff7e8;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  box-shadow: 0 10px 18px rgba(197, 93, 39, 0.35);
}



.participant-name {
  text-align: center;
  font-size: 1.2rem;
  font-weight: 800;
  color: #ffe8c8;
  line-height: 1.2;
}

@media (max-width: 640px) {
  .edition-title {
    font-size: 1.3rem;
  }

  .shame-card {
    width: 100%;
    padding: 1.75rem 1rem 1.5rem;
  }

  .participant-name {
    font-size: 1.05rem;
  }
}

.container {
  display: flex;
  justify-content: center;
}
</style>

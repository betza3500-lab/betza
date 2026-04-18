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
  <div v-for="edition in editions">
    <h2 class="name">{{edition}}</h2>
        <div class="container">
        <template v-for="participant in participants">
          <div style="order: 4" v-if="participant[edition] == 'L'">
            <div class="pictureContainer">
              <ParticipantPicture  border="5px solid #FF80FF" ribbon="LOSER"  :pictureId="participant.PictureID" />
            </div>
            <div class="name">{{participant.naam}}</div>
          </div>
      </template>
    </div>
  </div>
</template>

<style>
.name {
  text-align: center;

}
.break {
  flex-basis: 100%;
  height: 0;
}

.pictureContainer {
  display: flex;
  justify-content: center;
}

.container {
  display: flex;
  gap: 20px;
  flex-direction: row;
  align-items: end;
  justify-content: center;
  margin-bottom: 3rem;
}
</style>

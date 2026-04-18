<script>
  import ParticipantPicture from '../components/ParticipantPicture.vue'

  export default {
  name: 'App',
  components: { ParticipantPicture },
  data: () => ({
    loaded: false,
    participants: {}
  }),
  async mounted () {
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
    } catch (e) {
      console.error(e)
    } finally {
      loader.hide() // hide loading screen
    }
  }
}
</script>
<template>
  <div>
    <div class="container">
      <div v-for="participant in participants">
        <div>
          <ParticipantPicture  padding="0.5rem" pictureSize="150px" :pictureId="participant.PictureID" />
        </div>
        <div class="name">{{participant.naam}}</div>
      </div>
    </div>
    
  </div>
</template>

<style>
  .name {
    text-align: center;

  }
  .container { 
    display: flex;
    gap: 20px;
    flex-direction: row;
    justify-content: space-around;    
    flex-wrap: wrap;
  }


  
</style>

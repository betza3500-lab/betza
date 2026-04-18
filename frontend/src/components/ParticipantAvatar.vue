<script setup>
  import { ref, watchEffect } from 'vue'
  
  const props = defineProps({
    pictureId: { type: String, required: false, default: 'DXX' },
    pictureSize: {type: String, required: false, default: '200px'},
    border: {type: String, required: false, default: ''},
    padding: {type: String, required: false, default: '0px'}
  })
  
  const picture = ref()
  watchEffect(async () => {
    picture.value = (await import( `../assets/participants/small/${props.pictureId}.jpg`)).default
  })

  </script>
  
  <template>
      <div class="box">
        <b-avatar :src="picture"></b-avatar>
      </div>
  </template>

<style>
  .box {
    position: relative;
  }
  .participantPicture {
    object-fit: cover;
    object-position: 25% 25%; 
  }
</style>
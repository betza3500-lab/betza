<script setup>
  import { computed } from 'vue'
  
  const props = defineProps({
    pictureId: { type: String, required: false, default: 'DXX' },
    pictureSize: {type: String, required: false, default: '200px'},
    border: {type: String, required: false, default: ''},
    padding: {type: String, required: false, default: '0px'}
  })
  
  const picture = computed(() => {
    const pictureId = String(props.pictureId ?? '').trim() || 'DXX'
    return `/api/avatar/${encodeURIComponent(pictureId)}`
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
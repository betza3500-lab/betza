<script setup>
  import { ref, watchEffect } from 'vue'
  
  const props = defineProps({
    pictureId: { type: String, required: false, default: 'DXX' },
    pictureSize: {type: String, required: false, default: '200px'},
    border: {type: String, required: false, default: ''},
    ribbon: {type: String, required: false, default: null},
    padding: {type: String, required: false, default: '0px'}
  })
  
  const picture = ref()
  watchEffect(async () => {
    picture.value = (await import( `../assets/participants/small/${props.pictureId}.jpg`)).default
  })

  </script>
  
  <template>
      <div class="box">
        <img class="participantPicture" :style="{ padding: padding, height: pictureSize, width: pictureSize, borderRadius: '25px', border: border }" :src="picture" />
        
        <div v-if="ribbon != null" class="ribbon">
        <div class="txt">
            {{ribbon}}
        </div>
    </div>
    </div>
  </template>

<style>
  .box {
    position: relative;
  }
  .ribbon {
    -webkit-transform: rotate(-45deg); 
      -moz-transform: rotate(-45deg); 
        -ms-transform: rotate(-45deg); 
        -o-transform: rotate(-45deg); 
            transform: rotate(-45deg); 
      border: 25px solid transparent;
      border-top: 25px solid #FF80FF;
      position: absolute;
      bottom: 0px;
      right: -32px;
      padding: 0 10px;
      width: 120px;
      color: white;
      font-family: sans-serif;
      size: 11px;
  }
  .ribbon .txt {
      position: absolute;
      top: -25px;
      left: 10px;
      font-weight: bolder;
  }
  .participantPicture {
    object-fit: cover;
    object-position: 25% 25%; 
  }
</style>
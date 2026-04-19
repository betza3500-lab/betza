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
  <div class="hall-of-fame" v-for="edition in editions" :key="edition">
    <h2 class="edition-title">{{ edition }}</h2>
    <div class="podium-container">
      <template v-for="participant in participants" :key="participant.PictureID + edition">

        <!-- 2nd place - left -->
        <div class="podium-slot place-2" v-if="participant[edition] == 2">
          <div class="medal-badge silver-badge">2</div>
          <div class="picture-wrapper silver-glow">
            <ParticipantPicture pictureSize="100px" border="5px solid silver" :pictureId="participant.PictureID" />
          </div>
          <div class="participant-name">{{ participant.naam }}</div>
          <div class="podium-block silver-block">
            <span class="podium-rank">2nd</span>
          </div>
        </div>

        <!-- 1st place - center -->
        <div class="podium-slot place-1" v-if="participant[edition] == 1">
          <div class="crown">👑</div>
          <div class="medal-badge gold-badge">1</div>
          <div class="picture-wrapper gold-glow">
            <ParticipantPicture pictureSize="140px" border="6px solid #daa520" :pictureId="participant.PictureID" />
          </div>
          <div class="participant-name gold-name">{{ participant.naam }}</div>
          <div class="podium-block gold-block">
            <span class="podium-rank">1st</span>
          </div>
        </div>

        <!-- 3rd place - right -->
        <div class="podium-slot place-3" v-if="participant[edition] == 3">
          <div class="medal-badge bronze-badge">3</div>
          <div class="picture-wrapper bronze-glow">
            <ParticipantPicture pictureSize="80px" border="4px solid #cd7f32" :pictureId="participant.PictureID" />
          </div>
          <div class="participant-name">{{ participant.naam }}</div>
          <div class="podium-block bronze-block">
            <span class="podium-rank">3rd</span>
          </div>
        </div>

      </template>
    </div>
  </div>
</template>

<style scoped>
.hall-of-fame {
  margin-bottom: 4rem;
}

.edition-title {
  text-align: center;
  font-size: 1.6rem;
  font-weight: bold;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin-bottom: 1.5rem;
  color: var(--betza-light);
}

.podium-container {
  display: flex;
  flex-direction: row;
  padding-left: 5%;
  padding-right: 5%;
  justify-content: center;
  align-items: flex-end;
  justify-content: center;
  gap: 0;
}

.podium-slot {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
}

/* Ordering: 2nd left, 1st center, 3rd right */
.place-2 { order: 1; }
.place-1 { order: 2; }
.place-3 { order: 3; }

.picture-wrapper {
  border-radius: 28px;
  padding: 4px;
  margin-bottom: 8px;
}

.gold-glow {
  box-shadow: 0 0 20px 6px rgba(218, 165, 32, 0.75), 0 0 40px 10px rgba(218, 165, 32, 0.3);
  border-radius: 28px;
}

.silver-glow {
  box-shadow: 0 0 14px 4px rgba(192, 192, 192, 0.65), 0 0 28px 8px rgba(192, 192, 192, 0.2);
  border-radius: 28px;
}

.bronze-glow {
  box-shadow: 0 0 12px 4px rgba(205, 127, 50, 0.6), 0 0 24px 7px rgba(205, 127, 50, 0.2);
  border-radius: 28px;
}

.crown {
  font-size: 2rem;
  margin-bottom: 2px;
  filter: drop-shadow(0 0 6px rgba(218,165,32,0.8));
}

.medal-badge {
  position: absolute;
  top: 2.6rem;
  right: 4px;
  width: 26px;
  height: 26px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 900;
  font-size: 0.8rem;
  color: #111;
  z-index: 1;
  box-shadow: 0 2px 6px rgba(0,0,0,0.5);
}

.place-1 .medal-badge { top: 3.2rem; }

.gold-badge   { background: linear-gradient(135deg, #ffe066, #daa520, #b8860b); color: #fff; }
.silver-badge { background: linear-gradient(135deg, #e8e8e8, #a8a8a8, #888); }
.bronze-badge { background: linear-gradient(135deg, #e8a070, #cd7f32, #8b4513); color: #fff; }

.participant-name {
  text-align: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: #eee;
  margin-bottom: 0;
  max-width: 120px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.gold-name {
  color: #f0c040;
  font-size: 1rem;
  text-shadow: 0 0 8px rgba(218,165,32,0.5);
}

.podium-block {
  width: 140px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px 6px 0 0;
  margin-top: 6px;
  font-weight: bold;
  font-size: 0.9rem;
  color: #fff;
}

.gold-block {
  height: 80px;
  background: linear-gradient(180deg, #daa520, #b8860b);
  box-shadow: inset 0 2px 6px rgba(255,255,200,0.3);
}

.silver-block {
  height: 55px;
  background: linear-gradient(180deg, #c0c0c0, #808080);
  box-shadow: inset 0 2px 6px rgba(255,255,255,0.2);
}

.bronze-block {
  height: 40px;
  background: linear-gradient(180deg, #cd7f32, #8b4513);
  box-shadow: inset 0 2px 6px rgba(255,200,150,0.2);
}

.podium-rank {
  font-size: 0.8rem;
  letter-spacing: 0.05em;
  opacity: 0.9;
}
</style>

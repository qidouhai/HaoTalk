<template>
  <img class="image-msg" :src="imgUrl" @load="loaded" @click="clicked" />
</template>

<script>
  import setPicSize from '@zz-app/setPicSize'
  import { sendIntroduceInfoDelayMsg } from '../../../assets/api/resourceApi'
  import { lego } from '@zz-common/lego'

  export default {
    name: 'image-link-msg-item',
    props: ['context'],
    computed: {
      imgUrl() {
        return setPicSize(this.context.text)
      },
    },
    methods: {
      loaded() {
        this.$emit('loaded')
      },
      clicked() {
        const { liveId = '', productId = '' } = this.context
        // 如果有直播id和商品id，请求直播接口后再跳转
        if (liveId && productId) {
          this.otherAction().then(() => {
            lego.send({
              pagetype: 'KEFUIM_HOME',
              actiontype: 'ATHENA_MESSAGE_ANSWER_LIVE',
            })
            this.$emit('img-link-clicked', this.context)
          })
        } else {
          this.$emit('img-link-clicked', this.context)
        }
      },
      otherAction() {
        const { liveId, productId } = this.context
        const params = {
          infoId: productId,
          liveId,
          delay: 2,
        }
        return sendIntroduceInfoDelayMsg(params).then((resp) => {
          return resp
        })
      },
    },
  }
</script>

<style scoped lang="less">
  @import 'ImageLinkMsgItem.less';
</style>

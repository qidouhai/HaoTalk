<template>
<div class="groupindex">
    <mu-appbar style="width: 100%" color="primary">
    <mu-button icon slot="left" @click="back">
      <mu-icon value="reply"></mu-icon>
    </mu-button>
    群聊设置
    <mu-button flat slot="right" @click="udpateUserdata">完成</mu-button>
  </mu-appbar>
  <mu-list-item avatar button :ripple="true">
    <mu-list-item-action>
        <mu-avatar>
            <img :src="item.avatar">
        </mu-avatar>
    </mu-list-item-action>
    <mu-list-item-title>{{item.name}}</mu-list-item-title>
    <mu-list-item-action>
        <mu-icon value="chat_bubble"></mu-icon>
    </mu-list-item-action>
   </mu-list-item>
   <mu-expansion-panel>
    <div slot="header">群聊成员</div>
    <mu-list>
          <!--动态渲染-->
          <div v-for="(item,index) in friends" class="item" :key="index">
            <mu-list-item avatar button @click="showPersonindex(item._id)"
                          :ripple="true">
              <mu-list-item-action>
                <mu-avatar>
                  <img :src="item.avatar">
                </mu-avatar>
              </mu-list-item-action>
              <mu-list-item-title>{{item.name}}</mu-list-item-title>
              <mu-list-item-action>
                <mu-icon value="chat_bubble"></mu-icon>
              </mu-list-item-action>
            </mu-list-item>
            <mu-divider inset/>
          </div>
        </mu-list>
    </mu-expansion-panel>
    <mu-button full-width color="primary" @click="buildroom" class="create-button">{{}}</mu-button>
</div>
</template>
<script>
export default {
    
}
</script>
<style lang="stylus" scoped>

</style>
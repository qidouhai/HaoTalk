<template>
  <div class="friend">
    <div class="gap"></div>
    <div class="tab">
      <mu-tabs full-width>
        <mu-tab value="tab1">
          <mu-icon value="star"></mu-icon>
          空间
        </mu-tab>
        <mu-tab value="tab2">
          <mu-icon value="location_on"></mu-icon>
          附近
        </mu-tab>
        <mu-tab value="tab3">
          <mu-icon value="terrain"></mu-icon>
          兴趣
        </mu-tab>
      </mu-tabs>
    </div>
    <div class="gap-1"></div>
    <mu-list>
      <div class="item">
      <mu-list-item>
        <mu-list-item-action>
          <mu-icon value="videocam" color="#64dd17"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>生活</mu-list-item-title>
        <mu-list-item-action>
          <mu-icon value="keyboard_arrow_right" ></mu-icon>
        </mu-list-item-action>
      </mu-list-item>
      <mu-divider inset/>
      <mu-list-item>
        <mu-list-item-action>
          <mu-icon value="video_library" color="#d84315"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>视频</mu-list-item-title>
        <mu-list-item-action>
          <mu-icon value="keyboard_arrow_right" ></mu-icon>
        </mu-list-item-action>
      </mu-list-item>
      <mu-divider inset/>
      <mu-list-item >
        <mu-list-item-action>
          <mu-icon value="headset" color="#1976d2"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>音乐</mu-list-item-title>
        <mu-list-item-action>
          <mu-icon value="keyboard_arrow_right" ></mu-icon>
        </mu-list-item-action>
      </mu-list-item>
      </div>
    </mu-list>

    <mu-list>
      <div class="item">
      <mu-list-item>
        <mu-list-item-action>
          <mu-icon value="book" color="#1e88e5"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>图书</mu-list-item-title>
        <mu-list-item-action>
          <mu-icon value="keyboard_arrow_right" ></mu-icon>
        </mu-list-item-action>
      </mu-list-item>
      <mu-divider inset/>
      <mu-list-item>
        <mu-list-item-action>
          <mu-icon value="whatshot" color="#ef6c00"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>新闻</mu-list-item-title>
        <mu-list-item-action>
          <mu-icon value="keyboard_arrow_right" ></mu-icon>
        </mu-list-item-action>
      </mu-list-item>
      <mu-divider inset/>
      <mu-list-item >
        <mu-list-item-action>
          <mu-icon value="videogame_asset" color="#00e5ff"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>游戏</mu-list-item-title>
        <mu-list-item-action>
          <mu-icon value="keyboard_arrow_right" ></mu-icon>
        </mu-list-item-action>
      </mu-list-item>
      </div>
    </mu-list>

    <mu-list>
      <div class="item">
      <mu-list-item >
        <mu-list-item-action>
          <mu-icon value="shopping_cart" color="#1e88e5"></mu-icon>
        </mu-list-item-action>
        <mu-list-item-title>购物</mu-list-item-title>
        <mu-list-item-action>
          <mu-icon value="keyboard_arrow_right" ></mu-icon>
        </mu-list-item-action>
      </mu-list-item>
      </div>
    </mu-list>
  </div>
</template>
<script>
export default({
  name: 'discover'
})
</script>
<style lang="stylus"  scoped>
@import '../../common/stylus/base.styl'
.friend
  .item
    background: color-w
  .gap
    position:relative
    height: 2vh
  .gap-1
    height: 1vh
  .tab
    height: 12vh
    overflow:hidden
    background: colot-w
    .mu-tabs
      background:color-w
      color:color-b
</style>

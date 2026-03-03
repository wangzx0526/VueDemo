<template>
  <el-col :span="1.5" style="margin-left: auto;">
    <el-tooltip content="搜索" placement="top">
      <el-button
        circle
        :icon="showSearch ? 'Search' : 'Search'"
        @click="toggleSearch"
      />
    </el-tooltip>
    <el-tooltip content="刷新" placement="top">
      <el-button circle icon="Refresh" @click="$emit('queryTable')" />
    </el-tooltip>
  </el-col>
</template>

<script>
export default {
  name: 'RightToolbar',
  props: {
    showSearch: {
      type: Boolean,
      default: true
    }
  },
  emits: ['update:showSearch', 'queryTable'],
  methods: {
    toggleSearch() {
      this.$emit('update:showSearch', !this.showSearch)
    }
  }
}
</script>

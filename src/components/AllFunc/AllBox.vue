<template>
  <n-tabs class="all-box" size="large" justify-content="space-evenly" animated>
    <n-tab-pane class="no-padding height--full" name="link" tab="捷径">
      <ShortCut />
    </n-tab-pane>
    <n-tab-pane class="no-padding height--full" name="note" tab="便签">
      <StickyNote />
    </n-tab-pane>
    <n-tab-pane class="no-padding height--full" name="more" tab="待办">
      <TodoList />
    </n-tab-pane>
  </n-tabs>
</template>

<script setup>
import { NTabs, NTabPane } from "naive-ui";
import ShortCut from "@/components/AllFunc/Box/ShortCut.vue";
import StickyNote from "@/components/AllFunc/Box/StickyNote.vue";
import TodoList from "@/components/AllFunc/Box/TodoList.vue";
</script>
<style>
.height--full {
  height: 100%;
}
</style>
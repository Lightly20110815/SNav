import { defineStore } from "pinia";
import defaultShortCut from "@/assets/defaultShortCut";
import defaultNote from "@/assets/defaultNote";
import defaultTodo from "@/assets/defaultTodo";

const useSiteDataStore = defineStore("siteData", {
  state: () => {
    return {
      // 捷径数据
      shortcutData: defaultShortCut,
      // 便签数据
      noteData: defaultNote,
      // 待办数据
      todoData: defaultTodo,
    };
  },
  actions: {
    setShortcutData(value) {
      this.shortcutData = value;
    },
    setNoteData(value) {
      this.noteData = value;
    },
    setTodoData(value) {
      this.todoData = value;
    },
  },

});

export default useSiteDataStore;

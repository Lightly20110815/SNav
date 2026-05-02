<template>
  <!-- 便签 -->
  <div class="sticky-note__layout">
    <Transition name="fade" mode="out-in">
      <div v-if="noteData[0]" class="sticky-note">
        <n-scrollbar class="scrollbar">
          <n-grid
            class="all-sticky-note"
            responsive="screen"
            cols="1 s:2 m:2 l:3"
            :x-gap="12"
            :y-gap="12"
          >
            <n-grid-item
              v-for="item in noteData"
              :key="item.id"
              class="sticky-note-item"
              @contextmenu="noteContextmenu($event, item)"
            >
              <div class="note-card">
                <div class="note-title">{{ item.title }}</div>
                <div class="note-content">{{ item.content }}</div>
                <div class="note-time">{{ item.time }}</div>
              </div>
            </n-grid-item>
            <n-grid-item
              class="sticky-note-item add"
              @click="addNoteModalOpen"
            >
              <SvgIcon iconName="icon-add" />
              <span class="name">添加便签</span>
            </n-grid-item>
          </n-grid>
        </n-scrollbar>
      </div>
      <div v-else class="not-sticky-note">
        <span class="tip">暂无便签，去添加吧</span>
        <n-button strong secondary @click="addNoteModalOpen">
          <template #icon>
            <SvgIcon iconName="icon-add" />
          </template>
          添加便签
        </n-button>
      </div>
    </Transition>
  </div>
  <!-- 添加/编辑便签 -->
  <n-modal
    preset="card"
    v-model:show="addNoteModalShow"
    :title="`${addNoteModalType ? '编辑' : '添加'}便签`"
    :bordered="false"
    @mask-click="addNoteClose"
  >
    <n-form
      ref="addNoteRef"
      :rules="addNoteRules"
      :model="addNoteValue"
      :label-width="80"
    >
      <n-form-item label="ID" path="id">
        <n-input-number
          disabled
          placeholder="请输入ID"
          v-model:value="addNoteValue.id"
          style="width: 100%"
          :show-button="false"
        />
      </n-form-item>
      <n-form-item label="便签标题" path="title">
        <n-input
          clearable
          show-count
          maxlength="20"
          v-model:value="addNoteValue.title"
          placeholder="请输入便签标题"
        />
      </n-form-item>
      <n-form-item label="便签内容" path="content">
        <n-input
          clearable
          type="textarea"
          :rows="4"
          maxlength="500"
          show-count
          v-model:value="addNoteValue.content"
          placeholder="请输入便签内容"
        />
      </n-form-item>
    </n-form>
    <template #footer>
      <n-space justify="end">
        <n-button strong secondary @click="addNoteClose"> 取消 </n-button>
        <n-button strong secondary @click="addOrEditNote">
          {{ addNoteModalType ? "编辑" : "添加" }}
        </n-button>
      </n-space>
    </template>
  </n-modal>
  <!-- 便签右键菜单 -->
  <n-dropdown
    placement="bottom-start"
    trigger="manual"
    size="large"
    :x="noteDropdownX"
    :y="noteDropdownY"
    :options="noteDropdownOptions"
    :show="noteDropdownShow"
    :on-clickoutside="
      () => {
        noteDropdownShow = false;
      }
    "
    @select="noteDropdownSelect"
  />
</template>

<script setup>
import { ref, nextTick, h, onMounted, watch } from "vue";
import {
  NButton,
  NScrollbar,
  NGrid,
  NGridItem,
  NSpace,
  NModal,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NDropdown,
} from "naive-ui";
import { storeToRefs } from "pinia";
import { siteStore } from "@/stores";
import SvgIcon from "@/components/SvgIcon.vue";

const site = siteStore();
const { noteData } = storeToRefs(site);

// 从 localStorage 加载便签数据
const loadNoteData = () => {
  try {
    const saved = localStorage.getItem("stickyNoteData");
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        site.setNoteData(parsed);
      }
    }
  } catch (e) {
    console.error("加载便签数据失败", e);
  }
};

// 保存便签数据到 localStorage
const saveNoteData = () => {
  try {
    localStorage.setItem("stickyNoteData", JSON.stringify(noteData.value));
  } catch (e) {
    console.error("保存便签数据失败", e);
  }
};

onMounted(() => {
  loadNoteData();
});

watch(
  noteData,
  () => {
    saveNoteData();
  },
  { deep: true }
);

// 图标渲染
const renderIcon = (icon) => {
  return () => {
    return h(SvgIcon, { iconName: `icon-${icon}` }, null);
  };
};

// 添加便签数据
const addNoteRef = ref(null);
const addNoteModalShow = ref(false);
const addNoteModalType = ref(false); // false 添加 / true 编辑
const addNoteValue = ref({
  id: null,
  title: "",
  content: "",
  time: "",
});
const addNoteRules = {
  id: {
    required: true,
    type: "number",
    message: "请输入合法 ID",
    trigger: ["input", "blur"],
  },
  title: {
    required: true,
    message: "请输入标题",
    trigger: ["input", "blur"],
  },
  content: {
    required: true,
    message: "请输入内容",
    trigger: ["input", "blur"],
  },
};

// 右键菜单数据
const noteDropdownX = ref(0);
const noteDropdownY = ref(0);
const noteDropdownShow = ref(false);
const noteDropdownOptions = [
  {
    label: "编辑",
    key: "edit",
    icon: renderIcon("edit"),
  },
  {
    label: "删除",
    key: "delete",
    icon: renderIcon("delete-1"),
  },
];

// 获取当前时间
const getCurrentTime = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const hour = String(now.getHours()).padStart(2, "0");
  const minute = String(now.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hour}:${minute}`;
};

// 关闭弹窗
const addNoteClose = () => {
  addNoteModalShow.value = false;
  addNoteValue.value = {
    id: null,
    title: "",
    content: "",
    time: "",
  };
};

// 开启添加便签
const addNoteModalOpen = () => {
  // 生成 ID
  const noteMaxID = noteData.value.reduce((max, item) => {
    return item.id > max ? item.id : max;
  }, -1);
  // 生成表单数据
  addNoteValue.value = {
    id: noteMaxID + 1,
    title: "",
    content: "",
    time: getCurrentTime(),
  };
  addNoteModalType.value = false;
  addNoteModalShow.value = true;
};

// 添加或编辑便签
const addOrEditNote = () => {
  addNoteRef.value?.validate((errors) => {
    if (errors) {
      $message.error("请检查您的输入");
      return false;
    }
    // 新增便签
    if (!addNoteModalType.value) {
      // 是否重复
      const isDuplicate = noteData.value?.some(
        (item) =>
          item.title === addNoteValue.value.title &&
          item.content === addNoteValue.value.content,
      );
      if (isDuplicate) {
        $message.error("已有相同标题和内容的便签");
        return false;
      }
      noteData.value.push({
        id: addNoteValue.value.id,
        title: addNoteValue.value.title,
        content: addNoteValue.value.content,
        time: getCurrentTime(),
      });
      $message.success("便签添加成功");
      addNoteClose();
      return true;
    } else {
      // 编辑便签
      const index = noteData.value.findIndex((item) => item.id === addNoteValue.value.id);
      if (index === -1) {
        $message.error("便签中不存在该项，请重试");
        return false;
      }
      noteData.value[index].title = addNoteValue.value.title;
      noteData.value[index].content = addNoteValue.value.content;
      noteData.value[index].time = getCurrentTime();
      $message.success("便签编辑成功");
      addNoteClose();
      return true;
    }
  });
};

// 删除便签
const delNote = () => {
  const deleteId = addNoteValue.value.id;
  if (typeof deleteId === "number") {
    const indexToRemove = noteData.value.findIndex((item) => item.id === deleteId);
    if (indexToRemove !== -1) {
      noteData.value.splice(indexToRemove, 1);
      // 将后续元素的 id 前移一位
      for (let i = indexToRemove; i < noteData.value.length; i++) {
        noteData.value[i].id = i;
      }
      $message.success("便签删除成功");
      return true;
    }
    $message.error("便签删除失败，请重试");
  } else {
    $message.error("便签删除失败，请重试");
  }
};

// 开启右键菜单
const noteContextmenu = (e, data) => {
  e.preventDefault();
  noteDropdownShow.value = false;
  // 写入弹窗数据
  const { id, title, content, time } = data;
  addNoteValue.value = { id, title, content, time };
  nextTick().then(() => {
    noteDropdownShow.value = true;
    noteDropdownX.value = e.clientX;
    noteDropdownY.value = e.clientY;
  });
};

// 右键菜单点击
const noteDropdownSelect = (key) => {
  noteDropdownShow.value = false;
  switch (key) {
    case "edit":
      addNoteModalType.value = true;
      addNoteModalShow.value = true;
      break;
    case "delete":
      $dialog.warning({
        title: "删除便签",
        content: `确认删除 ${addNoteValue.value.title} 便签？此操作将无法恢复！`,
        positiveText: "删除",
        negativeText: "取消",
        onPositiveClick: () => {
          delNote();
        },
      });
      break;
    default:
      break;
  }
};
</script>

<style lang="scss" scoped>
.sticky-note__layout {
  display: flex;
  flex-direction: column;
  width: 100%;
  height: 100%;
  .sticky-note {
    width: 100%;
    height: 100%;
    overflow-y: auto;
    .all-sticky-note {
      padding: 20px;
      box-sizing: border-box;
      .sticky-note-item {
        cursor: pointer;
        min-height: 160px;
        display: flex;
        .note-card {
          flex: 1;
          width: 100%;
          min-height: 160px;
          padding: 16px;
          display: flex;
          flex-direction: column;
          background-color: var(--main-background-light-color);
          border-radius: 8px;
          transition:
            background-color 0.3s,
            box-shadow 0.3s;
          .note-title {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 8px;
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
            color: var(--main-text-color);
          }
          .note-content {
            flex: 1;
            font-size: 14px;
            line-height: 1.6;
            overflow: hidden;
            display: -webkit-box;
            -webkit-line-clamp: 4;
            -webkit-box-orient: vertical;
            color: var(--main-text-grey-color);
            word-break: break-word;
            overflow-wrap: break-word;
            text-overflow: ellipsis;
          }
          .note-time {
            font-size: 12px;
            margin-top: 10px;
            opacity: 0.7;
            color: var(--main-text-grey-color);
          }
          &:hover {
            background-color: var(--main-background-hover-color);
            box-shadow: 0 0 0px 2px var(--main-background-hover-color);
          }
          &:active {
            box-shadow: none;
          }
        }
        &.add {
          flex: 1;
          width: 100%;
          min-height: 160px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: var(--main-background-light-color);
          border-radius: 8px;
          font-size: 16px;
          transition:
            background-color 0.3s,
            box-shadow 0.3s;
          .i-icon {
            width: 1rem;
            margin-right: 6px;
            font-size: 20px;
            opacity: 1;
          }
          .name {
            overflow: hidden;
            text-overflow: ellipsis;
            white-space: nowrap;
          }
          &:hover {
            background-color: var(--main-background-hover-color);
            box-shadow: 0 0 0px 2px var(--main-background-hover-color);
          }
          &:active {
            box-shadow: none;
          }
        }
      }
    }
  }
  .not-sticky-note {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    .tip {
      font-size: 24px;
      margin-bottom: 20px;
      color: var(--main-text-color);
    }
  }
}
</style>
